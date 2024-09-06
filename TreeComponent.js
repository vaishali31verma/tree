import React, { useState } from "react";


const TreeComponent = ({ data, renderNodeHeader, nodePadding = 12, customClassName = "", renderOnLastNode, icon: Icon, draggable = false, onDragEnd, ...props }) => {
	const [treeData, setTreeData] = useState(data);

	const handleDrop = (droppedNodeId, targetNodeId) => {
		const moveNode = (tree, nodeId, targetId) => {
			let draggedNode = null;
			const removeNode = (nodes) => {
				return nodes.reduce((acc, node) => {
					if (node.id == nodeId) {
						draggedNode = { ...node };
						return acc;
					} else if (node.children && node.children.length > 0) {
						node.children = removeNode(node.children);
					}
					acc.push({ ...node });
					return acc;
				}, []);
			};
			const insertNode = (nodes, targetId) => {
				return nodes.map((node) => {
					if (node.id == targetId) {
						if (!node.children) node.children = [];
						node.children.push(draggedNode);
					} else if (node.children) {
						node.children = insertNode(node.children, targetId);
					}
					return { ...node };
				});
			};
			const treeWithoutNode = removeNode(JSON.parse(JSON.stringify(tree)));
			return insertNode(treeWithoutNode, targetId);
		};

		if (droppedNodeId !== targetNodeId) {
			const newTreeData = moveNode(treeData, droppedNodeId, targetNodeId);
			onDragEnd(newTreeData, droppedNodeId, targetNodeId)
			setTreeData(newTreeData);
		}
	};

	return (
		<div className="w-full flex flex-col gap-2">
			{treeData.map((item) => (
				<TreeNode
					key={item.id}
					node={item}
					level={0}
					renderNodeHeader={renderNodeHeader}
					nodePadding={nodePadding}
					customClassName={customClassName}
					renderOnLastNode={renderOnLastNode}
					icon={Icon}
					onDrop={handleDrop}
					draggable={draggable}
					{...props}
				/>
			))}
		</div>
	);
};

const TreeNode = ({ node, level, renderNodeHeader, nodePadding, customClassName, renderOnLastNode, icon: Icon, onDrop, ...props }) => {
	const [isOpen, setIsOpen] = useState(false);

	const toggleOpen = () => {
		setIsOpen((prevState) => !prevState);
	};

	const handleDragStart = (e) => {
		e.dataTransfer.setData("nodeId", node.id);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
	};

	const handleDrop = (e) => {
		e.preventDefault();
		const droppedNodeId = e.dataTransfer.getData("nodeId");
		onDrop(droppedNodeId, node.id);
	};

	return (
		<div className="w-full flex flex-col gap-2">
			<div
				className={` ${customClassName} w-full h-[3rem] !px-4 rounded-t-[0.75rem] bg-[#115c88] text-[#fff] cursor-pointer flex items-center gap-2 group`}
				draggable
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<div className="w-full flex items-center justify-start" style={{ paddingLeft: `${level * nodePadding}px` }}>
					{renderNodeHeader ? (
						renderNodeHeader({ node, level, isOpen, toggleOpen })
					) : (
						<>
							{node?.children && node?.children.length > 0 ? (
								<p
									onClick={toggleOpen}
									className={`transform transition-transform duration-300 ease-in-out flex gap-2 ${isOpen ? "rotate-90" : "rotate-0"}`}
								>
									<span className="w-4 h-4 fill-white">
										<Icon className="w-4 h-4 fill-white" /> {/* Use the passed icon prop */}
									</span>
								</p>
							) : (
								<span className="w-4"></span>
							)}
							<span className="pl-2">{node.name}</span>
						</>
					)}
				</div>
			</div>

			{isOpen && (
				<>
					{node?.children &&
						node?.children.map((child) => (
							<TreeNode
								key={child.id}
								node={child}
								level={level + 1}
								renderNodeHeader={renderNodeHeader}
								nodePadding={nodePadding}
								customClassName={customClassName}
								renderOnLastNode={renderOnLastNode}
								icon={Icon}
								onDrop={onDrop}
								{...props}
							/>
						))}
					{renderOnLastNode && renderOnLastNode({ node, level, isOpen })}
				</>
			)}
		</div>
	);
};

export default TreeComponent;
