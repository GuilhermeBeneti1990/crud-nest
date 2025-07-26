class IUser {
    description: string;
    name: string;
    id: number;
    createdAt: Date | null;
    userId: number | null;
}

export class ResponseUserDTO {
    name: string;
    email: string;
    id: number;
    Items: IUser[];
}

export class ResponseCreateOrUpdateUserDTO {
    id: number;
    name: string;
    email: string;
}