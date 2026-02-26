import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(_ctx: GetServerSidePropsContext) {
  return { redirect: { destination: '/admin/cms/pages', permanent: false } };
}

export default function CmsIndex() {
  return null;
}
