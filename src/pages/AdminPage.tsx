import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminImages from './AdminImages';
import PackageManager from '@/components/admin/PackageManager';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">어드민</h1>
        <Tabs defaultValue="packages" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="packages">패키지 추가</TabsTrigger>
            <TabsTrigger value="images">이미지 관리</TabsTrigger>
          </TabsList>
          <TabsContent value="packages" className="mt-6">
            <PackageManager />
          </TabsContent>
          <TabsContent value="images" className="mt-6">
            <AdminImages />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
