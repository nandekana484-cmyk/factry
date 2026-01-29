import { useMemo } from "react";

interface FolderNode {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
  children?: FolderNode[];
}

interface AdminFolderTreeProps {
  folders: FolderNode[];
  checkedIds: number[];
  onChange: (ids: number[]) => void;
}

// 階層構造を構築
function buildTree(items: FolderNode[]): FolderNode[] {
  const map = new Map<number, FolderNode>();
  const roots: FolderNode[] = [];
  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });
  items.forEach((item) => {
    const node = map.get(item.id)!;
    if (item.parent_id === null) {
      roots.push(node);
    } else {
      const parent = map.get(item.parent_id);
      if (parent) parent.children!.push(node);
    }
  });
  return roots;
}

export default function AdminFolderTree({ folders, checkedIds, onChange }: AdminFolderTreeProps) {
  const tree = useMemo(() => buildTree(folders), [folders]);

  // チェック状態の変更
  const handleCheck = (id: number, checked: boolean) => {
    let newIds = checked
      ? Array.from(new Set([...checkedIds, id]))
      : checkedIds.filter((fid) => fid !== id);
    onChange(newIds);
  };

  const renderTree = (nodes: FolderNode[], level = 0) => (
    <ul className={level === 0 ? "" : "ml-4 border-l pl-2"}>
      {nodes.map((node) => (
        <li key={node.id} className="flex items-center py-1">
          <input
            type="checkbox"
            checked={checkedIds.includes(node.id)}
            onChange={(e) => handleCheck(node.id, e.target.checked)}
            className="mr-2"
          />
          <span className="font-mono text-blue-600 font-semibold mr-1">{node.code}</span>
          <span>{node.name}</span>
          {node.children && node.children.length > 0 && renderTree(node.children, level + 1)}
        </li>
      ))}
    </ul>
  );

  return <div>{renderTree(tree)}</div>;
}
