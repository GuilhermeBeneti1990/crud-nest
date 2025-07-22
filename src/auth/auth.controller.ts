import { Body, Controller, Post } from '@nestjs/common';
import { SignInDTO } from './dto/signin';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  signIn(@Body() signinDto: SignInDTO) {
    return this.authService.authenticate(signinDto);
  }
}
