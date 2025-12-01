"""
Session Management and Memory System
Demonstrates: Sessions, State management, Long-term memory
"""

import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import hashlib

@dataclass
class HealthSession:
    """Health analysis session data structure"""
    session_id: str
    user_id: str
    timestamp: datetime
    data_summary: Dict
    analysis_results: Dict
    wellness_score: float
    recommendations: List[str]
    
    def to_dict(self) -> Dict:
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

class InMemorySessionService:
    """In-memory session management for active sessions"""
    
    def __init__(self):
        self.active_sessions: Dict[str, HealthSession] = {}
        self.session_state: Dict[str, Dict] = {}
    
    def create_session(self, user_id: str, data: Dict) -> str:
        """Create new health analysis session"""
        session_id = f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        session = HealthSession(
            session_id=session_id,
            user_id=user_id,
            timestamp=datetime.now(),
            data_summary=data.get('summary', {}),
            analysis_results=data.get('analysis', {}),
            wellness_score=data.get('wellness_score', 0.0),
            recommendations=data.get('recommendations', [])
        )
        
        self.active_sessions[session_id] = session
        self.session_state[session_id] = {
            'status': 'active',
            'last_activity': datetime.now(),
            'context': data
        }
        
        return session_id
    
    def get_session(self, session_id: str) -> Optional[HealthSession]:
        """Retrieve active session"""
        return self.active_sessions.get(session_id)
    
    def update_session_state(self, session_id: str, updates: Dict):
        """Update session state"""
        if session_id in self.session_state:
            self.session_state[session_id].update(updates)
            self.session_state[session_id]['last_activity'] = datetime.now()
    
    def pause_session(self, session_id: str):
        """Pause session for long-running operations"""
        if session_id in self.session_state:
            self.session_state[session_id]['status'] = 'paused'
    
    def resume_session(self, session_id: str):
        """Resume paused session"""
        if session_id in self.session_state:
            self.session_state[session_id]['status'] = 'active'
            self.session_state[session_id]['last_activity'] = datetime.now()
    
    def cleanup_expired_sessions(self, hours: int = 24):
        """Clean up sessions older than specified hours"""
        cutoff = datetime.now() - timedelta(hours=hours)
        expired = [
            sid for sid, state in self.session_state.items()
            if state['last_activity'] < cutoff
        ]
        
        for session_id in expired:
            self.active_sessions.pop(session_id, None)
            self.session_state.pop(session_id, None)
        
        return len(expired)

class MemoryBank:
    """Long-term memory storage using SQLite"""
    
    def __init__(self, db_path: str = "health_memory.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Initialize SQLite database for long-term memory"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Sessions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                data_summary TEXT,
                analysis_results TEXT,
                wellness_score REAL,
                recommendations TEXT
            )
        ''')
        
        # User patterns table for long-term insights
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_patterns (
                user_id TEXT,
                pattern_type TEXT,
                pattern_data TEXT,
                confidence REAL,
                last_updated TEXT,
                PRIMARY KEY (user_id, pattern_type)
            )
        ''')
        
        # Health trends table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS health_trends (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                metric_name TEXT,
                trend_direction TEXT,
                change_rate REAL,
                period_days INTEGER,
                recorded_at TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def store_session(self, session: HealthSession):
        """Store session in long-term memory"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO sessions 
            (session_id, user_id, timestamp, data_summary, analysis_results, wellness_score, recommendations)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            session.session_id,
            session.user_id,
            session.timestamp.isoformat(),
            json.dumps(session.data_summary),
            json.dumps(session.analysis_results),
            session.wellness_score,
            json.dumps(session.recommendations)
        ))
        
        conn.commit()
        conn.close()
    
    def get_user_history(self, user_id: str, days: int = 30) -> List[Dict]:
        """Retrieve user's session history"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        
        cursor.execute('''
            SELECT * FROM sessions 
            WHERE user_id = ? AND timestamp >= ?
            ORDER BY timestamp DESC
        ''', (user_id, cutoff))
        
        sessions = []
        for row in cursor.fetchall():
            sessions.append({
                'session_id': row[0],
                'user_id': row[1],
                'timestamp': row[2],
                'data_summary': json.loads(row[3]) if row[3] else {},
                'analysis_results': json.loads(row[4]) if row[4] else {},
                'wellness_score': row[5],
                'recommendations': json.loads(row[6]) if row[6] else []
            })
        
        conn.close()
        return sessions
    
    def store_user_pattern(self, user_id: str, pattern_type: str, pattern_data: Dict, confidence: float):
        """Store identified user patterns"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_patterns
            (user_id, pattern_type, pattern_data, confidence, last_updated)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user_id,
            pattern_type,
            json.dumps(pattern_data),
            confidence,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
    
    def get_user_patterns(self, user_id: str) -> Dict[str, Dict]:
        """Retrieve user's behavioral patterns"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT pattern_type, pattern_data, confidence, last_updated
            FROM user_patterns WHERE user_id = ?
        ''', (user_id,))
        
        patterns = {}
        for row in cursor.fetchall():
            patterns[row[0]] = {
                'data': json.loads(row[1]),
                'confidence': row[2],
                'last_updated': row[3]
            }
        
        conn.close()
        return patterns

class ContextCompactor:
    """Context engineering for efficient memory usage"""
    
    @staticmethod
    def compact_session_data(sessions: List[Dict], max_size: int = 5) -> Dict:
        """Compact multiple sessions into summarized context"""
        if not sessions:
            return {}
        
        # Sort by timestamp (most recent first)
        sorted_sessions = sorted(sessions, key=lambda x: x['timestamp'], reverse=True)
        recent_sessions = sorted_sessions[:max_size]
        
        # Aggregate metrics
        total_wellness = sum(s.get('wellness_score', 0) for s in recent_sessions)
        avg_wellness = total_wellness / len(recent_sessions) if recent_sessions else 0
        
        # Extract key patterns
        all_recommendations = []
        metric_trends = {}
        
        for session in recent_sessions:
            all_recommendations.extend(session.get('recommendations', []))
            
            # Extract metric trends
            data_summary = session.get('data_summary', {})
            for metric, value in data_summary.items():
                if metric.endswith('_avg_7d'):
                    metric_name = metric.replace('_avg_7d', '')
                    if metric_name not in metric_trends:
                        metric_trends[metric_name] = []
                    metric_trends[metric_name].append(value)
        
        # Calculate trend directions
        trend_analysis = {}
        for metric, values in metric_trends.items():
            if len(values) >= 2:
                trend_analysis[metric] = {
                    'direction': 'improving' if values[0] > values[-1] else 'declining',
                    'stability': 'stable' if abs(values[0] - values[-1]) < (values[0] * 0.1) else 'variable'
                }
        
        return {
            'summary_period': f"{len(recent_sessions)} sessions",
            'avg_wellness_score': round(avg_wellness, 1),
            'trend_analysis': trend_analysis,
            'common_recommendations': list(set(all_recommendations)),
            'last_session': recent_sessions[0]['timestamp'] if recent_sessions else None
        }
    
    @staticmethod
    def generate_context_hash(context: Dict) -> str:
        """Generate hash for context deduplication"""
        context_str = json.dumps(context, sort_keys=True)
        return hashlib.md5(context_str.encode()).hexdigest()

class HealthMemoryManager:
    """Integrated memory management system"""
    
    def __init__(self, db_path: str = "health_memory.db"):
        self.session_service = InMemorySessionService()
        self.memory_bank = MemoryBank(db_path)
        self.context_compactor = ContextCompactor()
    
    async def create_analysis_session(self, user_id: str, health_data: Dict) -> str:
        """Create new analysis session with memory integration"""
        
        # Get user's historical context
        history = self.memory_bank.get_user_history(user_id, days=30)
        compacted_context = self.context_compactor.compact_session_data(history)
        
        # Create session with historical context
        enhanced_data = {
            **health_data,
            'historical_context': compacted_context,
            'user_patterns': self.memory_bank.get_user_patterns(user_id)
        }
        
        session_id = self.session_service.create_session(user_id, enhanced_data)
        return session_id
    
    def finalize_session(self, session_id: str):
        """Finalize session and store in long-term memory"""
        session = self.session_service.get_session(session_id)
        if session:
            # Store in long-term memory
            self.memory_bank.store_session(session)
            
            # Identify and store patterns
            self._identify_patterns(session)
    
    def _identify_patterns(self, session: HealthSession):
        """Identify behavioral patterns from session data"""
        user_id = session.user_id
        
        # Get recent history for pattern analysis
        history = self.memory_bank.get_user_history(user_id, days=14)
        
        if len(history) >= 3:  # Need minimum data for pattern detection
            # Sleep pattern analysis
            sleep_scores = [h.get('wellness_score', 0) for h in history]
            if len(sleep_scores) >= 3:
                avg_score = sum(sleep_scores) / len(sleep_scores)
                trend = 'improving' if sleep_scores[0] > sleep_scores[-1] else 'stable'
                
                self.memory_bank.store_user_pattern(
                    user_id,
                    'wellness_trend',
                    {
                        'average_score': avg_score,
                        'trend': trend,
                        'consistency': 'high' if max(sleep_scores) - min(sleep_scores) < 10 else 'variable'
                    },
                    confidence=0.8
                )

# Example usage
async def demo_memory_system():
    """Demonstrate the memory management system"""
    
    memory_manager = HealthMemoryManager()
    
    # Simulate user sessions
    user_id = "user123"
    
    sample_data = {
        "summary": {
            "steps_avg_7d": 8500,
            "heart_rate_avg_7d": 72,
            "sleep_avg_7d": 7.2
        },
        "analysis": {
            "trends": {"steps": "increasing"},
            "anomalies": []
        },
        "wellness_score": 85.5,
        "recommendations": ["Maintain current activity level", "Consider sleep optimization"]
    }
    
    # Create session
    session_id = await memory_manager.create_analysis_session(user_id, sample_data)
    print(f"Created session: {session_id}")
    
    # Simulate long-running operation
    memory_manager.session_service.pause_session(session_id)
    print("Session paused for processing...")
    
    # Resume and finalize
    memory_manager.session_service.resume_session(session_id)
    memory_manager.finalize_session(session_id)
    print("Session finalized and stored in long-term memory")
    
    # Retrieve user history
    history = memory_manager.memory_bank.get_user_history(user_id)
    print(f"User has {len(history)} sessions in history")

if __name__ == "__main__":
    import asyncio
    asyncio.run(demo_memory_system())