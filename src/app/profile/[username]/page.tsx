


async function ProfilePage({ params }: { params: { username: string } }) {
    await new Promise(r => setTimeout(r, 4000));
  return (
    <div>ProfilePage</div>
  )
}

export default ProfilePage