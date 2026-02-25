export default function SimpleTest() {
  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl font-bold">Simple Test Page</h1>
      <p className="text-gray-600 mt-4">If you can see this, pages are rendering correctly.</p>
      <div className="mt-6 p-4 bg-blue-100 rounded">
        <p>Next step: Check if Clerk is loading</p>
        <a href="/agents/test" className="text-blue-600 hover:underline">
          Go to Clerk test page
        </a>
      </div>
    </div>
  );
}
