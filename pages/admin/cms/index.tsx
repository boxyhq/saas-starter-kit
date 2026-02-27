export async function getServerSideProps() {
  return { redirect: { destination: '/admin/cms/pages', permanent: false } };
}

export default function CmsIndex() {
  return null;
}
