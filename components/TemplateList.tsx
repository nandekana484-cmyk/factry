export default function TemplateList() {
  return (
    <div className="flex-1 border-b p-4">
      <h2 className="font-bold text-lg mb-2">テンプレート一覧</h2>

      <ul className="space-y-2">
        <li className="p-2 border rounded cursor-pointer hover:bg-gray-100">
          テンプレートA
        </li>
        <li className="p-2 border rounded cursor-pointer hover:bg-gray-100">
          テンプレートB
        </li>
        <li className="p-2 border rounded cursor-pointer hover:bg-gray-100">
          テンプレートC
        </li>
      </ul>
    </div>
  );
}