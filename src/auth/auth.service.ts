import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SignInDTO } from './dto/signin';
import { PrismaService } from 'src/prisma/prisma.service';
import { HashingServiceProtocol } from './hash/hashing.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashingService: HashingServiceProtocol,
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

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
