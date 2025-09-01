import React from 'react'
import PackageDetail from 'src/pages/PackageDetail'

export { Page }

function Page(pageProps: any) {
  return <PackageDetail {...pageProps} />
}