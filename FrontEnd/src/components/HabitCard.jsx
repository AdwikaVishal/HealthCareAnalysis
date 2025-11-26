export default function HabitCard({ habit }) {
  const getIcon = (type) => {
    const icons = {
      sleep: '🌙',
      hydration: '💧',
      movement: '🏃‍♂️',
      stress: '🧘‍♀️'
    };
    return icons[type] || '✨';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50 dark:bg-red-950/20';
      case 'medium': return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20';
      default: return 'border-green-400 bg-green-50 dark:bg-green-950/20';
    }
  };

  return (
    <div className={`card-gradient border-2 ${getPriorityColor(habit.priority)} rounded-lg p-4`}>
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getIcon(habit.type)}</div>
        <div className="flex-1">
          <h4 className="font-semibold dark:text-white text-slate-900 mb-1">{habit.title}</h4>
          <p className="text-sm dark:text-gray-300 text-slate-700 mb-2">{habit.description}</p>
          <div className="flex items-center justify-between">
            <span className={`text-xs px-2 py-1 rounded-full ${
              habit.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
              habit.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            }`}>
              {habit.priority} priority
            </span>
            <span className="text-xs dark:text-gray-400 text-slate-600">+{habit.impact} points</span>
          </div>
        </div>
      </div>
    </div>
  );
}