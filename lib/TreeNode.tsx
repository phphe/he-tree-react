export const defaultProps = {
  /**
   * 
   */
  indent: 20,
  draggable: true,
  droppable: true,
}

export const TreeNode = function TreeNode(props) {
  const style = { paddingLeft: props.level * props.indent + 'px' }
  const onDragStartHandle = (e: DragEvent) => {
    e.dataTransfer.setData("text", "he-tree");
    e.dataTransfer!.dropEffect = 'move'
  }
  const onDragOverHandle = (e) => {
    e.preventDefault();
  }
  const onDropHandle = (e) => {
    e.preventDefault();
  }
  const onDragEnterHandle = (e) => {
    console.log(`enter ${props.node.text}`);
  }
  const onDragLeaveHandle = (e) => {
    console.log(`leave ${props.node.text}`);
  }
  return <div style={style} draggable={props.draggable} onDragStart={onDragStartHandle} onDragOver={onDragOverHandle} onDrop={onDropHandle} onDragEnter={onDragEnterHandle} onDragLeave={onDragLeaveHandle}>
    {props.children}
    {props.node.text === 'Next' && <div className="border-red h-10"></div>}
  </div>
}

TreeNode.defaultProps = defaultProps