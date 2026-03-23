type FollowButtonProps = {
  profileUserId: string;
  isFollowing: boolean;
  nextPath: string;
};

export function FollowButton({ profileUserId, isFollowing, nextPath }: FollowButtonProps) {
  return (
    <form action={isFollowing ? "/api/profile/unfollow" : "/api/profile/follow"} method="post">
      <input type="hidden" name="profileUserId" value={profileUserId} />
      <input type="hidden" name="next" value={nextPath} />
      <button
        type="submit"
        className={`rounded-full px-5 py-3 text-sm font-semibold ${
          isFollowing ? "bg-slate-100 text-slate-700" : "bg-slate-900 text-white"
        }`}
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
    </form>
  );
}
