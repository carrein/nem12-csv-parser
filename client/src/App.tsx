import { trpc } from "./trpc";

const App = () => {
  const { data, isLoading } = trpc.user.getUsers.useQuery();

  if (isLoading) return <div>Loading ...</div>;

  return (
    <div>
      <ul>
        {(data ?? []).map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
