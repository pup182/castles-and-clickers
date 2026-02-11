import { useState, useMemo } from 'react';
import { useGameStore, calculateHeroStats } from '../store/gameStore';
import { CLASSES } from '../data/classes';
import { SKILL_TREES, arePrerequisitesMet, calculateRespecCost, TIER_REQUIREMENTS, countSkillsByTier } from '../data/skillTrees';
import SkillNode from './SkillNode';
import HeroIcon from './icons/HeroIcon';
import { TreeIcon } from './icons/ui';
import ClassIcon from './icons/ClassIcon';

const SkillTreeScreen = () => {
  const {
    heroes,
    gold,
    getSkillPoints,
    unlockSkill,
    respecHero,
  } = useGameStore();

  const [selectedHeroId, setSelectedHeroId] = useState(heroes[0]?.id || null);
  const [showRespecConfirm, setShowRespecConfirm] = useState(false);

  const selectedHero = heroes.find(h => h.id === selectedHeroId);
  const skillTree = selectedHero ? SKILL_TREES[selectedHero.classId] : null;
  const heroSkills = selectedHero?.skills || [];

  const skillPointInfo = selectedHero ? getSkillPoints(selectedHero.id) : { total: 0, used: 0, available: 0 };
  const respecCost = calculateRespecCost(skillPointInfo.used);
  const stats = selectedHero ? calculateHeroStats(selectedHero, heroes) : null;

  // Organize skills by tier
  const skillsByTier = useMemo(() => {
    if (!skillTree) return { 0: [], 1: [], 2: [], 3: [] };

    const tiers = { 0: [], 1: [], 2: [], 3: [] };
    for (const skill of skillTree.skills) {
      const tier = skill.tier ?? 0;
      if (tiers[tier]) {
        tiers[tier].push(skill);
      }
    }

    return tiers;
  }, [skillTree]);

  // Count unlocked skills per tier for progress display
  const tierProgress = useMemo(() => {
    if (!selectedHero) return {};
    return {
      0: countSkillsByTier(selectedHero.classId, heroSkills, 0),
      1: countSkillsByTier(selectedHero.classId, heroSkills, 1),
      2: countSkillsByTier(selectedHero.classId, heroSkills, 2),
      3: countSkillsByTier(selectedHero.classId, heroSkills, 3),
    };
  }, [selectedHero, heroSkills]);

  const handleUnlockSkill = (skillId) => {
    unlockSkill(selectedHeroId, skillId);
  };

  const handleRespec = () => {
    const result = respecHero(selectedHeroId);
    if (result.success) {
      setShowRespecConfirm(false);
    }
  };

  const tierLabels = {
    0: 'Core Skills',
    1: 'Tier 1',
    2: 'Tier 2',
    3: 'Capstones',
  };

  const getTierRequirementText = (tier) => {
    if (tier === 0) return 'Always available';
    const req = TIER_REQUIREMENTS[tier];
    const prevTier = tier - 1;
    const have = tierProgress[prevTier] || 0;
    const met = have >= req;
    return met
      ? `Unlocked (${have}/${req} Tier ${prevTier} skills)`
      : `Requires ${req} Tier ${prevTier} skills (${have}/${req})`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {heroes.length === 0 ? (
        <div className="text-gray-500 text-center py-12">
          <div className="flex justify-center mb-4">
            <TreeIcon size={48} />
          </div>
          Recruit heroes first!
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Left Panel: Hero Selection & Info */}
          <div className="w-72 flex-shrink-0 space-y-4">
            {/* Hero Tabs */}
            <div className="flex gap-1">
              {heroes.filter(Boolean).map(hero => {
                const heroPoints = getSkillPoints(hero.id);
                return (
                  <button
                    key={hero.id}
                    onClick={() => setSelectedHeroId(hero.id)}
                    className={`flex-1 p-2 rounded-lg border-2 transition-all relative ${
                      hero.id === selectedHeroId
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-gray-700 bg-gray-900 hover:border-gray-600'
                    }`}
                  >
                    {heroPoints.available > 0 && (
                      <div className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[10px] font-bold
                                      w-5 h-5 rounded-full flex items-center justify-center
                                      animate-pulse shadow-lg shadow-green-500/50">
                        +{heroPoints.available}
                      </div>
                    )}
                    <div className="flex justify-center"><HeroIcon classId={hero.classId} equipment={hero.equipment} size={24} /></div>
                    <div className="text-xs text-gray-400 truncate">{hero.name}</div>
                  </button>
                );
              })}
            </div>

            {/* Hero Info */}
            {selectedHero && (
              <div className="bg-gray-900 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <HeroIcon classId={selectedHero.classId} equipment={selectedHero.equipment} size={40} />
                  <div>
                    <div className="font-bold text-white">{selectedHero.name}</div>
                    <div className="text-sm text-gray-400">Level {selectedHero.level} {CLASSES[selectedHero.classId].name}</div>
                  </div>
                </div>

                {/* Skill Points */}
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Skill Points</span>
                    <span className={`text-lg font-bold ${skillPointInfo.available > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                      {skillPointInfo.available} / {skillPointInfo.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${skillPointInfo.total > 0 ? (skillPointInfo.used / skillPointInfo.total) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Earn 1 point every 3 levels ({skillPointInfo.used} used, max 10)
                  </div>
                </div>

                {/* Stats with skill bonuses */}
                {stats && (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <div className="text-green-400 font-bold">{stats.maxHp}</div>
                      <div className="text-[10px] text-gray-500">HP</div>
                    </div>
                    <div>
                      <div className="text-red-400 font-bold">{stats.attack}</div>
                      <div className="text-[10px] text-gray-500">ATK</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">{stats.defense}</div>
                      <div className="text-[10px] text-gray-500">DEF</div>
                    </div>
                    <div>
                      <div className="text-yellow-400 font-bold">{stats.speed}</div>
                      <div className="text-[10px] text-gray-500">SPD</div>
                    </div>
                  </div>
                )}

                {/* Respec Button */}
                {skillPointInfo.used > 0 && (
                  <button
                    onClick={() => setShowRespecConfirm(true)}
                    disabled={gold < respecCost}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
                      gold >= respecCost
                        ? 'bg-orange-600 hover:bg-orange-500 text-white'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Respec Skills ({respecCost} gold)
                  </button>
                )}
              </div>
            )}

            {/* Legend */}
            <div className="bg-gray-900 rounded-lg p-3 space-y-2">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Legend</div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-yellow-500/20 border-2 border-yellow-400" />
                <span className="text-gray-400">Unlocked</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-blue-500/20 border-2 border-blue-400" />
                <span className="text-gray-400">Available</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-gray-800/50 border-2 border-gray-600" />
                <span className="text-gray-400">Locked</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-[8px] text-white font-bold">A</div>
                <span className="text-gray-400">Active Skill</span>
              </div>
            </div>

            {/* Tier Info */}
            <div className="bg-gray-900 rounded-lg p-3 space-y-2">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Progression</div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Tier 1: Need 2 Core skills</div>
                <div>Tier 2: Need 3 Tier 1 skills</div>
                <div>Capstone: Need 4 Tier 2 skills</div>
              </div>
              <div className="text-xs text-yellow-400 mt-2">
                Only 10 skills obtainable - choose wisely!
              </div>
            </div>
          </div>

          {/* Right Panel: Skill Tree by Tiers */}
          <div className="flex-1">
            {skillTree && (
              <>
                <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <ClassIcon classId={selectedHero.classId} size={24} /> {skillTree.name} Skills
                </h3>

                <div className="space-y-6">
                  {[0, 1, 2, 3].map(tier => {
                    const skills = skillsByTier[tier] || [];
                    if (skills.length === 0) return null;

                    const tierUnlocked = tier === 0 || tierProgress[tier - 1] >= TIER_REQUIREMENTS[tier];

                    return (
                      <div key={tier} className={`${!tierUnlocked ? 'opacity-50' : ''}`}>
                        {/* Tier Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`text-sm font-bold ${tier === 3 ? 'text-purple-400' : 'text-gray-300'}`}>
                            {tierLabels[tier]}
                          </div>
                          <div className="flex-1 h-px bg-gray-700" />
                          <div className={`text-xs ${tierUnlocked ? 'text-green-400' : 'text-gray-500'}`}>
                            {getTierRequirementText(tier)}
                          </div>
                        </div>

                        {/* Skills Grid */}
                        <div className={`flex flex-wrap gap-4 ${tier === 3 ? 'justify-center' : ''}`}>
                          {skills.map(skill => (
                            <SkillNode
                              key={skill.id}
                              skill={skill}
                              isUnlocked={heroSkills.includes(skill.id)}
                              isAvailable={arePrerequisitesMet(skill, heroSkills, selectedHero.classId)}
                              canAfford={skillPointInfo.available > 0}
                              onUnlock={handleUnlockSkill}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Respec Confirmation Modal */}
      {showRespecConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Respec Skills?</h3>
            <p className="text-gray-400 mb-4">
              Reset all skills for <span className="text-yellow-400 font-bold">{selectedHero?.name}</span>?
              This will cost <span className="text-yellow-400 font-bold">{respecCost} gold</span>.
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Your starter skill will remain unlocked.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRespecConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRespec}
                className="flex-1 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-all"
              >
                Respec ({respecCost}g)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillTreeScreen;
