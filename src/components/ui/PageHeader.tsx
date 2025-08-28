import React from "react";

interface PageHeaderProps {
  title: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  return <h1 className="text-2xl font-bold">{title}</h1>;
};
