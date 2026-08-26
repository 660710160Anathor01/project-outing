interface CardTemplateProps {
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}



export function CardTemplate( { title, description, children, footer, className }: CardTemplateProps ) {
    return (
        <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
            {title && <h1 className="text-2xl font-bold text-black">{title}</h1>}
            {description && <p className="text-sm text-gray-500">{description}</p>}
            {children}
            {footer && <div className="mt-4">{footer}</div>}
        </div>
    );
}