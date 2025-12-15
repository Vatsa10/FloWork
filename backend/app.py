"""Flask API for Flowork workflow builder."""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
from pathlib import Path

project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root))

from src.models.workflow import Workflow
from src.models.node import Node, RoutingRule, RoutingRules
from src.storage.file_storage import get_storage
from src.core.graph_builder import GraphBuilder
from src.core.executor import WorkflowExecutor
from src.utils.logger import get_logger

app = Flask(__name__)
CORS(app)

logger = get_logger(__name__)
storage = get_storage()
graph_builder = GraphBuilder()
executor = WorkflowExecutor()


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy", "service": "flowork-api"}), 200


@app.route('/api/workflows', methods=['GET'])
def list_workflows():
    """List all workflows with metadata."""
    try:
        workflows = storage.list_with_metadata()
        return jsonify({"workflows": workflows}), 200
    except Exception as e:
        logger.error(f"Error listing workflows: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/workflows/<workflow_id>', methods=['GET'])
def get_workflow(workflow_id):
    """Get a specific workflow by ID."""
    try:
        workflow = storage.load(workflow_id)
        if not workflow:
            return jsonify({"error": "Workflow not found"}), 404
        
        return jsonify({"workflow": workflow.to_dict()}), 200
    except Exception as e:
        logger.error(f"Error getting workflow {workflow_id}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/workflows', methods=['POST'])
def create_workflow():
    """Create a new workflow."""
    try:
        data = request.json
        
        if not data.get('name'):
            return jsonify({"error": "Workflow name is required"}), 400
        
        nodes = []
        for node_data in data.get('nodes', []):
            routing_rules_data = node_data.get('routing_rules', {})
            routing_rules = RoutingRules(
                default_target=routing_rules_data.get('default_target', 'END'),
                conditional_targets=[
                    RoutingRule(**rule) for rule in routing_rules_data.get('conditional_targets', [])
                ]
            )
            
            node = Node(
                id=node_data.get('id'),
                name=node_data['name'],
                prompt=node_data['prompt'],
                routing_rules=routing_rules,
                metadata=node_data.get('metadata', {})
            )
            nodes.append(node)
        
        workflow = Workflow(
            name=data['name'],
            description=data.get('description'),
            nodes=nodes,
            metadata=data.get('metadata', {})
        )
        
        if storage.save(workflow):
            return jsonify({"workflow": workflow.to_dict()}), 201
        else:
            return jsonify({"error": "Failed to save workflow"}), 500
            
    except Exception as e:
        logger.error(f"Error creating workflow: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/workflows/<workflow_id>', methods=['PUT'])
def update_workflow(workflow_id):
    """Update an existing workflow."""
    try:
        existing_workflow = storage.load(workflow_id)
        if not existing_workflow:
            return jsonify({"error": "Workflow not found"}), 404
        
        data = request.json
        
        nodes = []
        for node_data in data.get('nodes', []):
            routing_rules_data = node_data.get('routing_rules', {})
            routing_rules = RoutingRules(
                default_target=routing_rules_data.get('default_target', 'END'),
                conditional_targets=[
                    RoutingRule(**rule) for rule in routing_rules_data.get('conditional_targets', [])
                ]
            )
            
            node = Node(
                id=node_data.get('id'),
                name=node_data['name'],
                prompt=node_data['prompt'],
                routing_rules=routing_rules,
                metadata=node_data.get('metadata', {})
            )
            nodes.append(node)
        
        existing_workflow.name = data.get('name', existing_workflow.name)
        existing_workflow.description = data.get('description', existing_workflow.description)
        existing_workflow.nodes = nodes
        existing_workflow.metadata = data.get('metadata', existing_workflow.metadata)
        
        if storage.save(existing_workflow):
            return jsonify({"workflow": existing_workflow.to_dict()}), 200
        else:
            return jsonify({"error": "Failed to update workflow"}), 500
            
    except Exception as e:
        logger.error(f"Error updating workflow {workflow_id}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/workflows/<workflow_id>', methods=['DELETE'])
def delete_workflow(workflow_id):
    """Delete a workflow."""
    try:
        if storage.delete(workflow_id):
            return jsonify({"message": "Workflow deleted successfully"}), 200
        else:
            return jsonify({"error": "Workflow not found"}), 404
    except Exception as e:
        logger.error(f"Error deleting workflow {workflow_id}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/workflows/<workflow_id>/execute', methods=['POST'])
def execute_workflow(workflow_id):
    """Execute a workflow with given input."""
    try:
        workflow = storage.load(workflow_id)
        if not workflow:
            return jsonify({"error": "Workflow not found"}), 404
        
        data = request.json
        initial_input = data.get('input', '')
        
        if not initial_input:
            return jsonify({"error": "Input is required"}), 400
        
        compiled_graph, recursion_limit, error = graph_builder.compile(workflow)
        if error:
            return jsonify({"error": error}), 400
        
        final_state, execution_log = executor.execute(
            compiled_graph,
            initial_input,
            recursion_limit
        )
        
        summary = executor.get_execution_summary(final_state)
        
        return jsonify({
            "final_state": {
                "input": final_state.get("input"),
                "node_outputs": final_state.get("node_outputs"),
                "last_response_content": final_state.get("last_response_content"),
                "current_node_id": final_state.get("current_node_id")
            },
            "execution_log": execution_log,
            "summary": summary
        }), 200
        
    except Exception as e:
        logger.error(f"Error executing workflow {workflow_id}: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/workflows/<workflow_id>/validate', methods=['POST'])
def validate_workflow(workflow_id):
    """Validate a workflow structure."""
    try:
        workflow = storage.load(workflow_id)
        if not workflow:
            return jsonify({"error": "Workflow not found"}), 404
        
        is_valid, error_message = workflow.validate()
        
        return jsonify({
            "valid": is_valid,
            "error": error_message
        }), 200
        
    except Exception as e:
        logger.error(f"Error validating workflow {workflow_id}: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
