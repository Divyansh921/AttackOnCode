export declare class RegisterDto {
    username: string;
    fullName: string;
    email: string;
    password: string;
    college?: string;
    year?: number;
}
export declare class LoginDto {
    emailOrUsername: string;
    password: string;
}
export declare class PasswordResetRequestDto {
    email: string;
}
export declare class PasswordResetDto {
    token: string;
    newPassword: string;
}
