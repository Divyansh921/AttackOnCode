import { ProjectsService, CreateProjectData } from './projects.service';
export declare class ProjectsController {
    private projectsService;
    constructor(projectsService: ProjectsService);
    list(status?: any, needsContributors?: boolean, search?: string, page?: number, limit?: number): Promise<{
        data: ({
            _count: {
                members: number;
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
                joinedAt: Date;
                projectId: string;
            })[];
            ownerTeam: {
                id: string;
                name: string;
            } | null;
            needs: {
                id: string;
                createdAt: Date;
                description: string | null;
                skills: import("@prisma/client/runtime/library").JsonValue;
                projectId: string;
                isFilled: boolean;
                roleTitle: string;
            }[];
        } & {
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getProject(id: string): Promise<{
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
            joinedAt: Date;
            projectId: string;
        })[];
        ownerTeam: ({
            leader: {
                username: string;
                id: string;
                fullName: string;
            };
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
        }) | null;
        needs: {
            id: string;
            createdAt: Date;
            description: string | null;
            skills: import("@prisma/client/runtime/library").JsonValue;
            projectId: string;
            isFilled: boolean;
            roleTitle: string;
        }[];
    } & {
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
    }>;
    create(userId: string, data: CreateProjectData): Promise<{
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
    }>;
    update(projectId: string, userId: string, data: any): Promise<{
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
    }>;
    addNeed(projectId: string, userId: string, data: {
        roleTitle: string;
        description?: string;
        skills?: string[];
    }): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        skills: import("@prisma/client/runtime/library").JsonValue;
        projectId: string;
        isFilled: boolean;
        roleTitle: string;
    }>;
}
