function PageHeader({title}) {
  return (
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary-blue">{title}</h1>
      </div>
  );
}

export default PageHeader;