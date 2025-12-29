import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-400">
        <li>
          <Link 
            href="/" 
            className="flex items-center hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={`${item.href}-${index}`} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-gray-600" />
            <Link 
              href={item.href}
              className={`hover:text-white transition-colors ${
                index === items.length - 1 ? 'text-white font-medium pointer-events-none' : ''
              }`}
              aria-current={index === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
