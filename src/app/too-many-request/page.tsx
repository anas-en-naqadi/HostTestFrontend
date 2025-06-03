export default function TooManyRequests() {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">429 - Too Many Requests</h1>
        <p className="text-gray-600">
          You’ve made too many requests. Please wait about 15min and try again.
        </p>
      </div>
    );
  }
  