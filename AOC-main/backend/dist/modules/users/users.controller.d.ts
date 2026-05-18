import { UsersService, BuilderSearchParams } from './users.service';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    searchBuilders(params: BuilderSearchParams): Promise<{
        data: {
            username: string;
            id: string;
            fullName: string;
            college: string | null;
            avatarUrl: string | null;
            bio: string | null;
            lookingForTeam: boolean;
            availabilityStatus: import(".prisma/client").$Enums.AvailabilityStatus;
            skills: {
                skill: {
                    name: string;
                    category: import(".prisma/client").$Enums.SkillCategory;
                };
                proficiency: import(".prisma/client").$Enums.ProficiencyLevel;
            }[];
            stats: {
                xp: number;
                hackathonsJoined: number;
                projectsCompleted: number;
                wins: number;
                contributions: number;
            } | null;
            _count: {
                teamMemberships: number;
                badges: number;
            };
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getSkills(category?: any): Promise<{
        id: string;
        name: string;
        category: import(".prisma/client").$Enums.SkillCategory;
    }[]>;
    getProfile(id: string): Promise<{
        username: string;
        email: string;
        id: string;
        createdAt: Date;
        fullName: string;
        college: string | null;
        year: number | null;
        avatarUrl: string | null;
        bio: string | null;
        githubUrl: string | null;
        linkedinUrl: string | null;
        portfolioUrl: string | null;
        lookingForTeam: boolean;
        availabilityStatus: import(".prisma/client").$Enums.AvailabilityStatus;
        skills: {
            skill: {
                id: string;
                name: string;
                category: import(".prisma/client").$Enums.SkillCategory;
            };
            proficiency: import(".prisma/client").$Enums.ProficiencyLevel;
            yearsExperience: number;
        }[];
        teamMemberships: {
            team: {
                id: string;
                name: string;
                status: import(".prisma/client").$Enums.TeamStatus;
            };
            role: string;
        }[];
        projectMemberships: {
            project: {
                id: string;
                name: string;
                status: import(".prisma/client").$Enums.ProjectStatus;
            };
            role: string;
        }[];
        stats: {
            userId: string;
            updatedAt: Date;
            xp: number;
            hackathonsJoined: number;
            projectsCompleted: number;
            wins: number;
            contributions: number;
            streakDays: number;
            lastActiveAt: Date;
        } | null;
        preferences: {
            userId: string;
            updatedAt: Date;
            preferredRoles: import("@prisma/client/runtime/library").JsonValue;
            preferredTeamSize: number | null;
            interestedDomains: import("@prisma/client/runtime/library").JsonValue;
            hackathonFrequency: import(".prisma/client").$Enums.HackathonFrequency;
            openToMentoring: boolean;
            preferredMode: import(".prisma/client").$Enums.HackathonMode;
        } | null;
        badges: {
            badge: {
                id: string;
                name: string;
                description: string | null;
                iconUrl: string | null;
            };
            earnedAt: Date;
        }[];
    }>;
    updateMyProfile(userId: string, data: any): Promise<{
        username: string;
        id: string;
        fullName: string;
        bio: string | null;
        lookingForTeam: boolean;
        availabilityStatus: import(".prisma/client").$Enums.AvailabilityStatus;
    }>;
    updateMySkills(userId: string, body: {
        skills: Array<{
            skillId: string;
            proficiency: string;
            yearsExperience?: number;
        }>;
    }): Promise<({
        skill: {
            id: string;
            name: string;
            category: import(".prisma/client").$Enums.SkillCategory;
        };
    } & {
        userId: string;
        skillId: string;
        proficiency: import(".prisma/client").$Enums.ProficiencyLevel;
        yearsExperience: number;
    })[]>;
}
