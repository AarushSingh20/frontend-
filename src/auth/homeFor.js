// Where a signed-in person goes:
//   organization accounts        -> the organization dashboard (/organization)
//   employees who lead a team    -> the Team Leader dashboard (/team-leader)
//   individual accounts          -> the individual creator's dashboard (/dashboard)
//   everyone else (other employees) -> the studio (/app)
export const homeFor = (user) => {
  if (user?.accountType === 'organization') return '/organization';
  if (user?.accountType === 'employee' && user.teamLeader) return '/team-leader';
  if (user?.accountType === 'individual') return '/dashboard';
  return '/app';
};
