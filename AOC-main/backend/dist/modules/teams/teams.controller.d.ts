import { TeamsService, TeamSearchParams, CreateTeamData, CreateOpeningData } from './teams.service';
export declare class TeamsController {
    private teamsService;
    constructor(teamsService: TeamsService);
    searchTeams(params: TeamSearchParams): Promise<{
        data: {
            id: string;
            createdAt: Date;
            name: string;
            description: string | null;
            _count: {
                members: number;
            };
            maxMembers: number;
            status: import(".prisma/client").$Enums.TeamStatus;
            leader: {
                username: string;
                id: string;
                fullName: string;
                avatarUrl: string | null;
            };
            members: {
                user: {
                    username: string;
                    id: string;
                    avatarUrl: string | null;
                };
                role: string;
            }[];
            openings: {
                id: string;
                title: string;
                requiredSkills: import("@prisma/client/runtime/library").JsonValue;
                slots: number;
            }[];
            hackathons: {
                hackathon: {
                    id: string;
                    name: string;
                    startDate: Date;
                };
                status: import(".prisma/client").$Enums.ParticipationStatus;
            }[];
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getTeam(id: string): Promise<{
        leader: {
            username: string;
            id: string;
            fullName: string;
            avatarUrl: string | null;
        };
        members: ({
            user: {
                username: string;
                id: string;
                fullName: string;
                avatarUrl: string | null;
                skills: ({
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
                })[];
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
        hackathons: ({
            hackathon: {
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
            };
            project: {
                id: string;
                createdAt: Date;
                name: string;
                description: string | null;
                updatedAt: Date;
                visibility: import(".prisma/client").$Enums.ProjectVisibility;
                status: import(".prisma/client").$Enums.ProjectStatus;
                githubRepo: string | null;
                demoUrl: string | null;
                techStack: import("@prisma/client/runtime/library").JsonValue;
                ownerTeamId: string | null;
                stars: number;
                forks: number;
            } | null;
        } & {
            teamId: string;
            status: import(".prisma/client").$Enums.ParticipationStatus;
            projectId: string | null;
            hackathonId: string;
            registeredAt: Date;
        })[];
        projects: {
            id: string;
            name: string;
            status: import(".prisma/client").$Enums.ProjectStatus;
            techStack: import("@prisma/client/runtime/library").JsonValue;
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
    }>;
    createTeam(userId: string, data: CreateTeamData): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        description: string | null;
        updatedAt: Date;
        leaderId: string;
        maxMembers: number;
        visibility: import(".prisma/client").$Enums.TeamVisibility;
        status: import(".prisma/client").$Enums.TeamStatus;
    }>;
    createOpening(teamId: string, userId: string, data: CreateOpeningData): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        title: string;
        teamId: string;
        status: import(".prisma/client").$Enums.OpeningStatus;
        requiredSkills: import("@prisma/client/runtime/library").JsonValue;
        slots: number;
    }>;
    applyToTeam(openingId: string, userId: string, body: {
        message?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        message: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        openingId: string;
        reviewedAt: Date | null;
    }>;
    acceptApplication(applicationId: string, userId: string): Promise<{
        status: string;
        teamId: string;
    }>;
    rejectApplication(applicationId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        message: string | null;
        status: import(".prisma/client").$Enums.ApplicationStatus;
        openingId: string;
        reviewedAt: Date | null;
    }>;
}
