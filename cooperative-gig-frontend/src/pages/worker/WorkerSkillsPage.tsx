import React, { useEffect, useState } from 'react';
import { updateMyAvailability, addWorkerSkill, removeWorkerSkill } from '../../api/workers';
import { WorkerSkill, SkillLevel } from '../../types';
import { PageHeader } from '../../components/common/PageHeader';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../api/client';
import { Award, Plus, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const WorkerSkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<WorkerSkill[]>([]);
  const [workerId, setWorkerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [skillName, setSkillName] = useState('Plumbing');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('EXPERT');

  const { success, error: toastError } = useToast();

  const loadProfile = async () => {
    try {
      // Calling updateMyAvailability('AVAILABLE') returns the current WorkerResponse with skills and profile ID
      const profile = await updateMyAvailability('AVAILABLE');
      setWorkerId(profile.id);
      setSkills(profile.skills || []);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId) return;
    setSubmitting(true);

    try {
      const updated = await addWorkerSkill(workerId, skillName, skillLevel);
      setSkills(updated.skills || []);
      success(`Added skill: ${skillName} (${skillLevel})`);
      setModalOpen(false);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    if (!workerId) return;
    if (!window.confirm('Are you sure you want to remove this skill?')) return;

    try {
      await removeWorkerSkill(workerId, skillId);
      setSkills(skills.filter((s) => s.id !== skillId));
      success('Skill removed successfully.');
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  };

  const getBadgeStyle = (level: string) => {
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

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading registered skills..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Verified Trade Skills"
        description="Registered competencies evaluated by the fair matching algorithm to dispatch appropriate tasks."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Skill
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Award className="w-5 h-5" />
                </div>
                <button
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-base font-bold text-slate-900">{skill.skillName}</h4>
              <div className="mt-2">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${getBadgeStyle(skill.skillLevel)}`}>
                  {skill.skillLevel}
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Eligible for Fair Dispatch
            </div>
          </div>
        ))}
      </div>

      {/* Add Skill Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Service Trade Skill">
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Trade Category
            </label>
            <select
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Carpentry">Carpentry</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Proficiency Level
            </label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
            >
              <option value="BEGINNER">BEGINNER (10 pts match score)</option>
              <option value="INTERMEDIATE">INTERMEDIATE (20 pts match score)</option>
              <option value="ADVANCED">ADVANCED (30 pts match score)</option>
              <option value="EXPERT">EXPERT (40 pts match score)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Add to Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
