import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
    return (
        <nav className="flex items-center space-x-2 text-sm mb-6 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100">
            <Link
                to="/dashboard"
                className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors font-medium"
            >
                <Home className="h-4 w-4" />
            </Link>
            {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    {item.href && index !== items.length - 1 ? (
                        <Link
                            to={item.href}
                            className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className={`${index === items.length - 1 ? 'text-indigo-600 font-semibold' : 'text-gray-600'}`}>
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default Breadcrumb;
