import MessageSkeleton from "./MessageSkeleton";

const MessagesSkeleton = () => {
  return (
    <div>
      {[...Array(20)].map((_, i) => (
        <MessageSkeleton key={i} numBlobs={4} />
      ))}
    </div>
  );
};

export default MessagesSkeleton;
