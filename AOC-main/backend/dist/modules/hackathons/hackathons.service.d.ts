import { PrismaService } from '../../common/prisma/prisma.service';
export interface CreateHackathonData {
    name: string;
    organizer?: string;
    mode?: 'online' | 'offline' | 'hybrid';
    location?: string;
    registrationDeadline?: Date;
    startDate: Date;
    endDate: Date;
    prizePool?: string;
    websiteUrl?: string;
    description?: string;
    maxTeamSize?: number;
    minTeamSize?: number;
    themes?: string[];
}
export declare class HackathonsService {
    private prisma;
    constructor(prisma: PrismaService);
    listHackathons(filter?: 'upcoming' | 'ongoing' | 'past', page?: any, limit?: any): Promise<{
        data: {
            teamsForming: number;
            buildersInterested: number;
            _count: {
                teams: number;
                interests: number;
            };
            id: string;
            createdAt: Date;
            name: string;
            description: string | null;
            organizer: string | null;
            mode: import(".prisma/client").$Enums.HackathonMode;
            location: string | null;
            registrationDeadline: Date | null;
            startDate: Date;
            endDate: Date;
            prizePool: string | null;
            websiteUrl: string | null;
            bannerUrl: string | null;
            maxTeamSize: number | null;
            minTeamSize: number | null;
            themes: import("@prisma/client/runtime/library").JsonValue;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getHackathon(id: string): Promise<{
        _count: {
            teams: number;
            interests: number;
        };
        teams: ({
            team: {
                leader: {
                    username: string;
                    id: string;
                    fullName: string;
                };
                members: ({
                    user: {
                        username: string;
                        id: string;
                        avatarUrl: string | null;
                    };
                } & {
                    role: string;
                    userId: string;
                    teamId: string;
                    joinedAt: Date;
                })[];
                openings: {
                    id: string;
                    createdAt: Date;
                    description: string | null;
                    title: string;
                    teamId: string;
                    status: import(".prisma/client").$Enums.OpeningStatus;
                    requiredSkills: import("@prisma/client/runtime/library").JsonValue;
                    slots: number;
                }[];
            } & {
                id: string;
                createdAt: Date;
                name: string;
                description: string | null;
                updatedAt: Date;
                leaderId: string;
                maxMembers: number;
                visibility: import(".prisma/client").$Enums.TeamVisibility;
                status: import(".prisma/client").$Enums.TeamStatus;
            };
        } & {
            teamId: string;
            status: import(".prisma/client").$Enums.ParticipationStatus;
            projectId: string | null;
            hackathonId: string;
            registeredAt: Date;
        })[];
        interests: ({
            user: {
                username: string;
                id: string;
                fullName: string;
                avatarUrl: string | null;
                lookingForTeam: boolean;
            };
        } & {
            userId: string;
            hackathonId: string;
            interestedAt: Date;
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        organizer: string | null;
        mode: import(".prisma/client").$Enums.HackathonMode;
        location: string | null;
        registrationDeadline: Date | null;
        startDate: Date;
        endDate: Date;
        prizePool: string | null;
        websiteUrl: string | null;
        bannerUrl: string | null;
        maxTeamSize: number | null;
        minTeamSize: number | null;
        themes: import("@prisma/client/runtime/library").JsonValue;
    }>;
    createHackathon(data: CreateHackathonData): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        organizer: string | null;
        mode: import(".prisma/client").$Enums.HackathonMode;
        location: string | null;
        registrationDeadline: Date | null;
        startDate: Date;
        endDate: Date;
        prizePool: string | null;
        websiteUrl: string | null;
        bannerUrl: string | null;
        maxTeamSize: number | null;
        minTeamSize: number | null;
        themes: import("@prisma/client/runtime/library").JsonValue;
    }>;
    expressInterest(hackathonId: string, userId: string): Promise<{
        status: string;
        hackathonId: string;
    }>;
    registerTeam(hackathonId: string, teamId: string, userId: string): Promise<{
        teamId: string;
        status: import(".prisma/client").$Enums.ParticipationStatus;
        projectId: string | null;
        hackathonId: string;
        registeredAt: Date;
    }>;
}
