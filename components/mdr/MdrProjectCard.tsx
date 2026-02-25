import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import {
  DocumentTextIcon,
  FolderOpenIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

interface MdrProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string | null;
    clientName?: string | null;
    projectNumber?: string | null;
    status: string;
    _count?: {
      sections?: number;
      members?: number;
    };
    compilations?: Array<{
      status: string;
      completedAt?: string | null;
    }>;
  };
  teamSlug: string;
}

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    ACTIVE: 'badge-success',
    ARCHIVED: 'badge-warning',
    FINAL: 'badge-neutral',
  };
  return map[status] ?? 'badge-neutral';
};

const MdrProjectCard = ({ project, teamSlug }: MdrProjectCardProps) => {
  const { t } = useTranslation('common');

  return (
    <Link href={`/teams/${teamSlug}/mdr/${project.id}`}>
      <div className="card bg-base-100 border border-base-200 hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
        <div className="card-body p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base line-clamp-2">
              {project.name}
            </h3>
            <span
              className={`badge badge-sm shrink-0 ${statusBadge(project.status)}`}
            >
              {t(`mdr-project-${project.status.toLowerCase()}`)}
            </span>
          </div>

          {project.clientName && (
            <p className="text-xs text-gray-500">{project.clientName}</p>
          )}
          {project.projectNumber && (
            <p className="text-xs text-gray-400">#{project.projectNumber}</p>
          )}

          {project.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
              {project.description}
            </p>
          )}

          <div className="flex gap-3 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FolderOpenIcon className="h-3.5 w-3.5" />
              {project._count?.sections ?? 0} sections
            </span>
            <span className="flex items-center gap-1">
              <UsersIcon className="h-3.5 w-3.5" />
              {project._count?.members ?? 0} members
            </span>
          </div>

          {project.compilations?.[0] && (
            <div className="mt-2 flex items-center gap-1.5">
              <DocumentTextIcon className="h-3.5 w-3.5 text-gray-400" />
              <span
                className={`badge badge-xs ${
                  project.compilations[0].status === 'COMPLETE'
                    ? 'badge-success'
                    : 'badge-warning'
                }`}
              >
                {project.compilations[0].status}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default MdrProjectCard;
