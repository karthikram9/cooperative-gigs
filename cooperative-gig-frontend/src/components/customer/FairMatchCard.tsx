import React from 'react';
import { MatchResult } from '../../types';
import { ShieldCheck, MapPin, Award, CheckCircle2, UserCheck, Star } from 'lucide-react';

interface FairMatchCardProps {
  match: MatchResult;
  isBest?: boolean;
  onAssign?: (workerId: number) => void;
  assigning?: boolean;
  userRole?: string;
}

export const FairMatchCard: React.FC<FairMatchCardProps> = ({
  match,
  isBest = false,
  onAssign,
  assigning = false,
  userRole,
}) => {
  const getSkillBadgeColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'EXPERT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADVANCED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'INTERMEDIATE':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div
      className={`rounded-2xl p-6 transition-all relative overflow-hidden ${
        isBest
          ? 'bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 border-2 border-emerald-500 shadow-md ring-4 ring-emerald-50'
          : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
      }`}
    >
      {isBest && (
        <div className="absolute top-0 right-0 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
          <Star className="w-3.5 h-3.5 fill-white" /> Top Recommended Fair Match
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-slate-900">{match.workerName}</h3>
            {match.verificationStatus === 'VERIFIED' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200" title="Identity & Police Verified">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {match.location || 'Local Area'}
            </span>
            <span>•</span>
            <span className={`px-2 py-0.5 rounded-md border font-semibold ${getSkillBadgeColor(match.skillLevel)}`}>
              {match.skillLevel} {match.matchedSkill}
            </span>
            <span>•</span>
            <span className="text-emerald-700 font-medium">● Available Now</span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end">
          <div className="text-xs text-slate-500 font-medium">Match Algorithmic Score</div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-emerald-700">{match.score}</span>
            <span className="text-xs text-slate-400 font-semibold">/ 60 pts</span>
          </div>
        </div>
      </div>

      {/* Why this worker was recommended (Explainable AI / Fairness Box) */}
      <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 mb-5">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-600" /> Transparent Fair Match Rationale
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>
              Skill Level: <strong className="text-slate-800">{match.skillLevel}</strong> (+{match.skillLevel === 'EXPERT' ? 40 : match.skillLevel === 'ADVANCED' ? 30 : match.skillLevel === 'INTERMEDIATE' ? 20 : 10} pts)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>
              Proximity Match: <strong className="text-slate-800">{match.location || 'Service zone'}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>
              Status: <strong className="text-slate-800">{match.verificationStatus} & {match.availabilityStatus}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span>Cooperative work rotation equity enabled</span>
          </div>
        </div>
      </div>

      {onAssign && (
        <div className="flex justify-end">
          <button
            onClick={() => onAssign(match.workerId)}
            disabled={assigning}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              isBest
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            {assigning ? 'Assigning...' : userRole === 'ADMIN' ? 'Dispatch & Assign Worker' : 'Select This Worker'}
          </button>
        </div>
      )}
    </div>
  );
};
