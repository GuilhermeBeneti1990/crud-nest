import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SignInDTO } from './dto/signin';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingServiceProtocol } from './hash/hashing.service';
import jwt from './config/jwt';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,

    @Inject(jwt.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwt>,
    private readonly jwtService: JwtService,
  ) {}

  async authenticate(signinDto: SignInDTO) {
    const user = await this.prisma.users.findFirst({
      where: {
        email: signinDto.email,
      },
    });

    if (!user) {
      throw new HttpException(
        'Login operation failed',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const passwordIsValid = await this.hashingService.compare(
      signinDto.password,
      user.passwordHash,
    );

    if (!passwordIsValid) {
      throw new HttpException(
        'Incorrect data to login',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        secret: this.jwtConfiguration.secret,
        expiresIn: this.jwtConfiguration.jwtTtl,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      },
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token,
    };
  }
}
