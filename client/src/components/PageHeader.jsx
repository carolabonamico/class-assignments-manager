function PageHeader({title, description}) {
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary-blue">{title}</h1>
      </div>
      <p className="text-muted mb-4">
        {description}
      </p>
    </>
  );
}

export default PageHeader;