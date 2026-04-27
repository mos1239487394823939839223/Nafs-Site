import { TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

export default function KPICard({ title, value, change, trend, sparklineData, icon: Icon, color = 'primary' }) {
  const isPositive = trend === 'up'
  
  const colorClasses = {
    primary: {
      bg: 'from-primary to-primary-dark',
      text: 'text-white',
      icon: 'text-white/30'
    },
    secondary: {
      bg: 'from-secondary to-secondary-dark',
      text: 'text-white',
      icon: 'text-white/30'
    },
    accent: {
      bg: 'from-accent to-accent-dark',
      text: 'text-white',
      icon: 'text-white/30'
    }
  }

  const colors = colorClasses[color] || colorClasses.primary

  return (
    <div className={`bg-gradient-to-br ${colors.bg} ${colors.text} rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {Icon && <Icon className={`w-12 h-12 ${colors.icon}`} />}
      </div>

      {/* Trend indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPositive ? (
            <div className="flex items-center gap-1 text-green-200">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">+{change}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-200">
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm font-medium">{change}%</span>
            </div>
          )}
          <span className="text-xs text-white/60">vs last period</span>
        </div>
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 -mb-2">
          <ResponsiveContainer width="100%" height={40}>
            <LineChart data={sparklineData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="rgba(255,255,255,0.5)" 
                strokeWidth={2} 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
