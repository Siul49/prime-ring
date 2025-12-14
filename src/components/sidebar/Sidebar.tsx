import { useCategoryStore } from '../../stores/categoryStore'
import './Sidebar.css'

interface SidebarProps {
    selectedCategoryId?: string
    onSelectCategory: (id: string | undefined) => void
}

export function Sidebar({ selectedCategoryId, onSelectCategory }: SidebarProps) {
    const { categories } = useCategoryStore()

    return (
        <aside className="sidebar glass">
            {/* 카테고리 */}
            <div className="sidebar-section">
                <h3 className="sidebar-title">카테고리</h3>
                <ul className="category-list">
                    <li
                        className={`category-item ${!selectedCategoryId ? 'category-item-active' : ''}`}
                        onClick={() => onSelectCategory(undefined)}
                    >
                        <span className="category-icon">📋</span>
                        <span className="category-name">전체 일정</span>
                    </li>
                    {categories.map((category) => (
                        <li
                            key={category.id}
                            className={`category-item ${selectedCategoryId === category.id ? 'category-item-active' : ''}`}
                            onClick={() => onSelectCategory(category.id)}
                        >
                            <span
                                className="category-dot"
                                style={{ backgroundColor: category.color }}
                            />
                            <span className="category-name">{category.name}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 태그 */}
            <div className="sidebar-section">
                <h3 className="sidebar-title">태그</h3>
                <div className="tag-list">
                    <span className="tag"># 중요</span>
                    <span className="tag"># 반복</span>
                    <span className="tag"># 리뷰필요</span>
                </div>
            </div>
        </aside>
    )
}

