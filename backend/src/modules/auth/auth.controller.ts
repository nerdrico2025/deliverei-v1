import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto, RefreshTokenDto, CreateAccountFromOrderDto, CadastroEmpresaDto } from './dto';
import { Public } from '../../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Public()
  @Post('cadastro-empresa')
  @HttpCode(HttpStatus.CREATED)
  async cadastroEmpresa(@Body() cadastroEmpresaDto: CadastroEmpresaDto) {
    return this.authService.cadastroEmpresa(cadastroEmpresaDto);
  }

  @Public()
  @Post('create-account-from-order')
  @HttpCode(HttpStatus.CREATED)
  async createAccountFromOrder(@Body() createAccountDto: CreateAccountFromOrderDto) {
    return this.authService.createAccountFromOrder(createAccountDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }
}
