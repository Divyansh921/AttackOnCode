import { PrismaService } from '../../common/prisma/prisma.service';
import { AvailabilityStatus, SkillCategory } from '@prisma/client';
export interface BuilderSearchParams {
    search?: string;
    skills?: string[];
    availability?: AvailabilityStatus;
    lookingForTeam?: boolean;
    category?: SkillCategory;
    college?: string;
    page?: number;
    limit?: number;
}
export interface UpdateProfileData {
    fullName?: string;
    bio?: string;
    college?: string;
    year?: number;
    githubUrl?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    lookingForTeam?: boolean;
    availabilityStatus?: AvailabilityStatus;
}
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
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
    getProfile(userId: string): Promise<{
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
    updateProfile(userId: string, data: UpdateProfileData): Promise<{
        username: string;
        id: string;
        fullName: string;
        bio: string | null;
        lookingForTeam: boolean;
        availabilityStatus: import(".prisma/client").$Enums.AvailabilityStatus;
    }>;
    updateSkills(userId: string, skills: Array<{
        skillId: string;
        proficiency: string;
        yearsExperience?: number;
    }>): Promise<({
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
    getAllSkills(category?: SkillCategory): Promise<{
        id: string;
        name: string;
        category: import(".prisma/client").$Enums.SkillCategory;
    }[]>;
}
