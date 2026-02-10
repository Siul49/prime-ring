import { useCategoryStore } from '../../stores/categoryStore'
import './Sidebar.css'

interface SidebarProps {
    selectedCategoryId?: string
    onSelectCategory: (id: string | undefined) => void
}

export function Sidebar({ selectedCategoryId, onSelectCategory }: SidebarProps) {
    const { categories } = useCategoryStore()

    return (
        <aside className="sidebar !bg-transparent !border-none !shadow-none">
            {/* 카테고리 */}
            <div className="sidebar-section mb-10">
                <h3 className="sidebar-title text-deep-navy/40 font-bold uppercase tracking-widest text-[10px] mb-4 pl-2">
                    Categories
                </h3>
                <ul className="category-list space-y-1">
                    <li
                        className={`category-item flex items-center gap-3 px-4 py-3 rounded transition-all cursor-pointer ${!selectedCategoryId ? 'bg-white shadow-sm ring-1 ring-deep-navy/5' : 'hover:bg-neutral-100/50'}`}
                        onClick={() => onSelectCategory(undefined)}
                    >
                        <span className="category-icon text-sm opacity-60">📋</span>
                        <span className={`category-name text-sm font-medium ${!selectedCategoryId ? 'text-deep-navy' : 'text-serene-blue'}`}>
                            All Events
                        </span>
                    </li>
                    {categories.map((category) => (
                        <li
                            key={category.id}
                            className={`category-item flex items-center gap-3 px-4 py-3 rounded transition-all cursor-pointer ${selectedCategoryId === category.id ? 'bg-white shadow-sm ring-1 ring-deep-navy/5' : 'hover:bg-neutral-100/50'}`}
                            onClick={() => onSelectCategory(category.id)}
                        >
                            <span
                                className="w-2.5 h-2.5 rounded-full shadow-sm"
                                style={{ backgroundColor: category.color }}
                            />
                            <span className={`category-name text-sm font-medium ${selectedCategoryId === category.id ? 'text-deep-navy' : 'text-serene-blue'}`}>
                                {category.name}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 태그 */}
            <div className="sidebar-section">
                <h3 className="sidebar-title text-deep-navy/40 font-bold uppercase tracking-widest text-[10px] mb-4 pl-2">
                    Tags
                </h3>
                <div className="tag-list flex flex-wrap gap-2">
                    {['# 중요', '# 반복', '# 리뷰필요'].map(tag => (
                        <span key={tag} className="tag text-[11px] font-medium text-serene-blue px-3 py-1 bg-white ring-1 ring-deep-navy/5 rounded-full hover:bg-neutral-50 cursor-pointer transition-colors">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </aside>
    )
}

