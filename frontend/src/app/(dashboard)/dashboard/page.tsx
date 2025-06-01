import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Bell, 
  FileText, 
  Plus,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  // Mock data - これらは後でAPIから取得する
  const stats = {
    totalConversations: 42,
    activeReminders: 7,
    draftDocuments: 12,
    completedToday: 8,
  };

  const recentActivity = [
    {
      id: '1',
      type: 'conversation',
      title: 'プロジェクト進捗確認',
      time: '2時間前',
    },
    {
      id: '2',
      type: 'reminder',
      title: 'クライアント会議',
      time: '4時間前',
    },
    {
      id: '3',
      type: 'draft',
      title: '月次レポート',
      time: '1日前',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="text-muted-foreground">
          AIチャット管理システムへようこそ
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総会話数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              前月比 +12%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">アクティブリマインダー</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeReminders}</div>
            <p className="text-xs text-muted-foreground">
              <Clock className="inline h-3 w-3 mr-1" />
              今日期限: 3件
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ドラフト文書</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draftDocuments}</div>
            <p className="text-xs text-muted-foreground">
              レビュー待ち: 4件
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日の完了</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">
              目標達成率: 80%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>クイックアクション</CardTitle>
          <CardDescription>
            よく使用する機能にすばやくアクセス
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/dashboard/conversations/new">
              <Plus className="mr-2 h-4 w-4" />
              新しい会話
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/reminders/new">
              <Plus className="mr-2 h-4 w-4" />
              リマインダー追加
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/drafts/new">
              <Plus className="mr-2 h-4 w-4" />
              ドラフト作成
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent activity and overview */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>最近のアクティビティ</CardTitle>
            <CardDescription>
              最新の活動履歴
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  {activity.type === 'conversation' && (
                    <MessageSquare className="h-4 w-4 text-primary" />
                  )}
                  {activity.type === 'reminder' && (
                    <Bell className="h-4 w-4 text-primary" />
                  )}
                  {activity.type === 'draft' && (
                    <FileText className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's schedule */}
        <Card>
          <CardHeader>
            <CardTitle>今日の予定</CardTitle>
            <CardDescription>
              本日のリマインダーとタスク
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="mx-auto h-8 w-8 mb-2" />
              <p>今日の予定はありません</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

DashboardPage.displayName = 'DashboardPage';
