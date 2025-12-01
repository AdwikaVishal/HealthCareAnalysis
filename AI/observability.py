"""
Observability System for Health Analysis
Demonstrates: Logging, Tracing, Metrics, Agent evaluation
"""

import logging
import time
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from functools import wraps
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('health_analysis.log'),
        logging.StreamHandler()
    ]
)

@dataclass
class TraceSpan:
    """Represents a trace span for distributed tracing"""
    span_id: str
    parent_id: Optional[str]
    operation_name: str
    start_time: float
    end_time: Optional[float]
    duration: Optional[float]
    tags: Dict[str, Any]
    logs: List[Dict[str, Any]]
    status: str  # 'started', 'completed', 'error'
    
    def to_dict(self) -> Dict:
        return asdict(self)

@dataclass
class Metric:
    """Represents a system metric"""
    name: str
    value: float
    timestamp: datetime
    tags: Dict[str, str]
    metric_type: str  # 'counter', 'gauge', 'histogram'

class HealthAnalysisTracer:
    """Distributed tracing for health analysis operations"""
    
    def __init__(self):
        self.spans: Dict[str, TraceSpan] = {}
        self.active_spans: List[str] = []
        self.logger = logging.getLogger('HealthTracer')
    
    def start_span(self, operation_name: str, parent_id: Optional[str] = None, **tags) -> str:
        """Start a new trace span"""
        span_id = str(uuid.uuid4())
        
        span = TraceSpan(
            span_id=span_id,
            parent_id=parent_id or (self.active_spans[-1] if self.active_spans else None),
            operation_name=operation_name,
            start_time=time.time(),
            end_time=None,
            duration=None,
            tags=tags,
            logs=[],
            status='started'
        )
        
        self.spans[span_id] = span
        self.active_spans.append(span_id)
        
        self.logger.info(f"Started span: {operation_name} [{span_id}]")
        return span_id
    
    def finish_span(self, span_id: str, status: str = 'completed', **tags):
        """Finish a trace span"""
        if span_id in self.spans:
            span = self.spans[span_id]
            span.end_time = time.time()
            span.duration = span.end_time - span.start_time
            span.status = status
            span.tags.update(tags)
            
            if span_id in self.active_spans:
                self.active_spans.remove(span_id)
            
            self.logger.info(f"Finished span: {span.operation_name} [{span_id}] - {span.duration:.3f}s")
    
    def log_to_span(self, span_id: str, level: str, message: str, **fields):
        """Add log entry to span"""
        if span_id in self.spans:
            log_entry = {
                'timestamp': time.time(),
                'level': level,
                'message': message,
                **fields
            }
            self.spans[span_id].logs.append(log_entry)
    
    def get_trace(self, span_id: str) -> Optional[Dict]:
        """Get complete trace for a span"""
        if span_id not in self.spans:
            return None
        
        root_span = self.spans[span_id]
        trace = {
            'trace_id': span_id,
            'spans': []
        }
        
        # Collect all related spans
        for span in self.spans.values():
            if span.span_id == span_id or span.parent_id == span_id:
                trace['spans'].append(span.to_dict())
        
        return trace

class MetricsCollector:
    """Collects and aggregates system metrics"""
    
    def __init__(self):
        self.metrics: List[Metric] = []
        self.counters: Dict[str, float] = {}
        self.gauges: Dict[str, float] = {}
        self.logger = logging.getLogger('MetricsCollector')
    
    def increment_counter(self, name: str, value: float = 1.0, **tags):
        """Increment a counter metric"""
        key = f"{name}:{':'.join(f'{k}={v}' for k, v in sorted(tags.items()))}"
        self.counters[key] = self.counters.get(key, 0) + value
        
        metric = Metric(
            name=name,
            value=self.counters[key],
            timestamp=datetime.now(),
            tags=tags,
            metric_type='counter'
        )
        self.metrics.append(metric)
        self.logger.debug(f"Counter {name}: {self.counters[key]}")
    
    def set_gauge(self, name: str, value: float, **tags):
        """Set a gauge metric"""
        key = f"{name}:{':'.join(f'{k}={v}' for k, v in sorted(tags.items()))}"
        self.gauges[key] = value
        
        metric = Metric(
            name=name,
            value=value,
            timestamp=datetime.now(),
            tags=tags,
            metric_type='gauge'
        )
        self.metrics.append(metric)
        self.logger.debug(f"Gauge {name}: {value}")
    
    def record_histogram(self, name: str, value: float, **tags):
        """Record a histogram value"""
        metric = Metric(
            name=name,
            value=value,
            timestamp=datetime.now(),
            tags=tags,
            metric_type='histogram'
        )
        self.metrics.append(metric)
        self.logger.debug(f"Histogram {name}: {value}")
    
    def get_metrics_summary(self, hours: int = 1) -> Dict:
        """Get metrics summary for the last N hours"""
        cutoff = datetime.now().timestamp() - (hours * 3600)
        recent_metrics = [m for m in self.metrics if m.timestamp.timestamp() > cutoff]
        
        summary = {
            'total_metrics': len(recent_metrics),
            'counters': {},
            'gauges': {},
            'histograms': {}
        }
        
        for metric in recent_metrics:
            if metric.metric_type == 'counter':
                summary['counters'][metric.name] = summary['counters'].get(metric.name, 0) + metric.value
            elif metric.metric_type == 'gauge':
                summary['gauges'][metric.name] = metric.value
            elif metric.metric_type == 'histogram':
                if metric.name not in summary['histograms']:
                    summary['histograms'][metric.name] = []
                summary['histograms'][metric.name].append(metric.value)
        
        return summary

class AgentEvaluator:
    """Evaluates agent performance and accuracy"""
    
    def __init__(self):
        self.evaluations: List[Dict] = []
        self.logger = logging.getLogger('AgentEvaluator')
    
    def evaluate_agent_performance(self, agent_name: str, input_data: Dict, 
                                 output_data: Dict, ground_truth: Optional[Dict] = None) -> Dict:
        """Evaluate agent performance"""
        
        evaluation = {
            'agent_name': agent_name,
            'timestamp': datetime.now().isoformat(),
            'input_size': len(str(input_data)),
            'output_size': len(str(output_data)),
            'processing_time': output_data.get('processing_time', 0),
            'success': output_data.get('status') == 'success',
            'accuracy_score': None,
            'confidence_score': output_data.get('confidence', 0),
            'error_rate': 0
        }
        
        # Calculate accuracy if ground truth is available
        if ground_truth:
            evaluation['accuracy_score'] = self._calculate_accuracy(output_data, ground_truth)
        
        # Evaluate output quality
        evaluation['quality_score'] = self._evaluate_output_quality(output_data)
        
        # Check for errors
        if 'error' in output_data or not evaluation['success']:
            evaluation['error_rate'] = 1.0
            evaluation['error_details'] = output_data.get('error', 'Unknown error')
        
        self.evaluations.append(evaluation)
        self.logger.info(f"Evaluated {agent_name}: Quality={evaluation['quality_score']:.2f}, "
                        f"Confidence={evaluation['confidence_score']:.2f}")
        
        return evaluation
    
    def _calculate_accuracy(self, output: Dict, ground_truth: Dict) -> float:
        """Calculate accuracy score against ground truth"""
        if not ground_truth:
            return 0.0
        
        # Simple accuracy calculation for health metrics
        correct_predictions = 0
        total_predictions = 0
        
        output_analysis = output.get('analysis', {})
        truth_analysis = ground_truth.get('analysis', {})
        
        # Compare trend predictions
        output_trends = output_analysis.get('trends', {})
        truth_trends = truth_analysis.get('trends', {})
        
        for metric in truth_trends:
            if metric in output_trends:
                total_predictions += 1
                if output_trends[metric].get('trend') == truth_trends[metric].get('trend'):
                    correct_predictions += 1
        
        return correct_predictions / total_predictions if total_predictions > 0 else 0.0
    
    def _evaluate_output_quality(self, output: Dict) -> float:
        """Evaluate output quality based on completeness and structure"""
        quality_score = 0.0
        max_score = 100.0
        
        # Check for required fields
        required_fields = ['analysis', 'timestamp']
        for field in required_fields:
            if field in output:
                quality_score += 20.0
        
        # Check analysis completeness
        analysis = output.get('analysis', {})
        if 'trends' in analysis and analysis['trends']:
            quality_score += 20.0
        
        if 'anomalies' in analysis:
            quality_score += 15.0
        
        if 'insights' in analysis and analysis['insights']:
            quality_score += 15.0
        
        # Check confidence score
        confidence = output.get('confidence', 0)
        if confidence > 0.7:
            quality_score += 10.0
        elif confidence > 0.5:
            quality_score += 5.0
        
        return min(quality_score / max_score, 1.0)
    
    def get_agent_performance_report(self, agent_name: Optional[str] = None, days: int = 7) -> Dict:
        """Generate performance report for agents"""
        cutoff = datetime.now().timestamp() - (days * 24 * 3600)
        
        relevant_evals = [
            e for e in self.evaluations 
            if (not agent_name or e['agent_name'] == agent_name) and
               datetime.fromisoformat(e['timestamp']).timestamp() > cutoff
        ]
        
        if not relevant_evals:
            return {'message': 'No evaluations found'}
        
        # Calculate aggregate metrics
        total_evals = len(relevant_evals)
        success_rate = sum(1 for e in relevant_evals if e['success']) / total_evals
        avg_quality = sum(e['quality_score'] for e in relevant_evals) / total_evals
        avg_confidence = sum(e['confidence_score'] for e in relevant_evals) / total_evals
        avg_processing_time = sum(e['processing_time'] for e in relevant_evals) / total_evals
        
        accuracy_scores = [e['accuracy_score'] for e in relevant_evals if e['accuracy_score'] is not None]
        avg_accuracy = sum(accuracy_scores) / len(accuracy_scores) if accuracy_scores else None
        
        return {
            'agent_name': agent_name or 'All Agents',
            'evaluation_period_days': days,
            'total_evaluations': total_evals,
            'success_rate': round(success_rate, 3),
            'average_quality_score': round(avg_quality, 3),
            'average_confidence': round(avg_confidence, 3),
            'average_accuracy': round(avg_accuracy, 3) if avg_accuracy else None,
            'average_processing_time': round(avg_processing_time, 3),
            'performance_grade': self._calculate_performance_grade(success_rate, avg_quality, avg_confidence)
        }
    
    def _calculate_performance_grade(self, success_rate: float, quality: float, confidence: float) -> str:
        """Calculate overall performance grade"""
        overall_score = (success_rate * 0.4 + quality * 0.4 + confidence * 0.2)
        
        if overall_score >= 0.9:
            return 'A'
        elif overall_score >= 0.8:
            return 'B'
        elif overall_score >= 0.7:
            return 'C'
        elif overall_score >= 0.6:
            return 'D'
        else:
            return 'F'

class ObservabilityManager:
    """Central observability management"""
    
    def __init__(self):
        self.tracer = HealthAnalysisTracer()
        self.metrics = MetricsCollector()
        self.evaluator = AgentEvaluator()
        self.logger = logging.getLogger('ObservabilityManager')
    
    def trace_operation(self, operation_name: str):
        """Decorator for tracing operations"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                span_id = self.tracer.start_span(operation_name, 
                                               function=func.__name__,
                                               args_count=len(args))
                
                start_time = time.time()
                try:
                    result = await func(*args, **kwargs)
                    
                    # Record success metrics
                    duration = time.time() - start_time
                    self.metrics.record_histogram('operation_duration', duration, 
                                                operation=operation_name)
                    self.metrics.increment_counter('operations_total', 
                                                 operation=operation_name, status='success')
                    
                    self.tracer.finish_span(span_id, 'completed', result_size=len(str(result)))
                    return result
                    
                except Exception as e:
                    # Record error metrics
                    self.metrics.increment_counter('operations_total', 
                                                 operation=operation_name, status='error')
                    self.tracer.log_to_span(span_id, 'error', str(e))
                    self.tracer.finish_span(span_id, 'error', error=str(e))
                    raise
                    
            return wrapper
        return decorator
    
    def get_system_health(self) -> Dict:
        """Get overall system health metrics"""
        metrics_summary = self.metrics.get_metrics_summary()
        
        # Calculate system health score
        total_operations = sum(metrics_summary.get('counters', {}).values())
        error_operations = metrics_summary.get('counters', {}).get('operations_total:status=error', 0)
        success_rate = 1 - (error_operations / total_operations) if total_operations > 0 else 1
        
        return {
            'timestamp': datetime.now().isoformat(),
            'system_status': 'healthy' if success_rate > 0.95 else 'degraded' if success_rate > 0.8 else 'unhealthy',
            'success_rate': round(success_rate, 3),
            'total_operations': int(total_operations),
            'active_spans': len(self.tracer.active_spans),
            'metrics_summary': metrics_summary
        }

# Example usage and integration
def demo_observability():
    """Demonstrate observability features"""
    
    obs_manager = ObservabilityManager()
    
    @obs_manager.trace_operation('health_data_analysis')
    async def analyze_health_data(data: Dict) -> Dict:
        """Sample health analysis function with observability"""
        
        # Simulate processing
        await asyncio.sleep(0.1)
        
        # Record custom metrics
        obs_manager.metrics.set_gauge('data_points_processed', len(data.get('timeseries', [])))
        obs_manager.metrics.increment_counter('analysis_requests')
        
        result = {
            'status': 'success',
            'analysis': {
                'trends': {'steps': {'trend': 'increasing'}},
                'anomalies': [],
                'insights': ['Good activity level']
            },
            'confidence': 0.85,
            'processing_time': 0.1
        }
        
        # Evaluate the result
        obs_manager.evaluator.evaluate_agent_performance('HealthAnalyzer', data, result)
        
        return result
    
    return obs_manager, analyze_health_data

if __name__ == "__main__":
    import asyncio
    
    async def main():
        obs_manager, analyze_func = demo_observability()
        
        # Run some sample analyses
        sample_data = {
            'timeseries': [
                {'metric': 'steps', 'value': 8500, 'day': '2024-01-01'},
                {'metric': 'heart_rate', 'value': 72, 'day': '2024-01-01'}
            ]
        }
        
        # Perform analysis
        result = await analyze_func(sample_data)
        print("Analysis completed:", result['status'])
        
        # Get system health
        health = obs_manager.get_system_health()
        print("System Health:", health['system_status'])
        
        # Get performance report
        report = obs_manager.evaluator.get_agent_performance_report('HealthAnalyzer')
        print("Performance Report:", report)
    
    asyncio.run(main())