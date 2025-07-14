
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { webhookService } from '@/services/webhookService';
import { useToast } from '@/hooks/use-toast';
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Activity, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  Send,
  Brain,
  RefreshCw
} from 'lucide-react';

const WebhookManager: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookType, setWebhookType] = useState<'discord' | 'telegram' | 'zapier' | 'pipedream'>('discord');
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadWebhookData();
  }, []);

  const loadWebhookData = () => {
    setEndpoints(webhookService.getEndpoints());
    setLogs(webhookService.getRecentLogs(20));
  };

  const addWebhook = () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive"
      });
      return;
    }

    try {
      webhookService.addEndpoint(webhookUrl, webhookType);
      setWebhookUrl('');
      loadWebhookData();
      
      toast({
        title: "Webhook Added",
        description: `${webhookType} webhook has been added successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add webhook",
        variant: "destructive"
      });
    }
  };

  const removeWebhook = (url: string) => {
    webhookService.removeEndpoint(url);
    loadWebhookData();
    
    toast({
      title: "Webhook Removed",
      description: "Webhook has been removed successfully",
    });
  };

  const testWebhook = async (url: string, type: string) => {
    try {
      const testPayload = {
        test: true,
        message: "Test webhook from AI Signals Platform",
        timestamp: new Date().toISOString()
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        toast({
          title: "Test Successful",
          description: `${type} webhook is working correctly`,
        });
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "Test Failed",
        description: `${type} webhook test failed: ${error}`,
        variant: "destructive"
      });
    }
  };

  const getWebhookIcon = (type: string) => {
    switch (type) {
      case 'discord':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'telegram':
        return <Send className="w-4 h-4 text-blue-400" />;
      case 'zapier':
        return <RefreshCw className="w-4 h-4 text-orange-400" />;
      case 'pipedream':
        return <Activity className="w-4 h-4 text-purple-400" />;
      default:
        return <Webhook className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Webhook */}
      <Card className="glass-card border-blue-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Webhook className="w-5 h-5 text-blue-400" />
            Webhook Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select value={webhookType} onValueChange={(value: any) => setWebhookType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="telegram">Telegram</SelectItem>
                <SelectItem value="zapier">Zapier</SelectItem>
                <SelectItem value="pipedream">Pipedream</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Enter webhook URL..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addWebhook} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          <div className="text-sm text-gray-400">
            <p className="mb-2">Webhook triggers:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>🎯 New signal generated</li>
              <li>💰 Significant price movement (&gt;0.5%)</li>
              <li>🧠 AI analysis requested</li>
              <li>🔄 Auto-refresh triggered</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Active Webhooks */}
      {endpoints.length > 0 && (
        <Card className="glass-card border-green-500/30">
          <CardHeader>
            <CardTitle className="text-white">Active Webhooks ({endpoints.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-800/40 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getWebhookIcon(endpoint.type)}
                    <div>
                      <div className="text-sm font-medium text-white capitalize">
                        {endpoint.type}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {endpoint.url.length > 50 
                          ? `${endpoint.url.substring(0, 50)}...` 
                          : endpoint.url
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                    <Button
                      onClick={() => testWebhook(endpoint.url, endpoint.type)}
                      variant="outline"
                      size="sm"
                      className="border-blue-500/30 hover:bg-blue-500/20"
                    >
                      Test
                    </Button>
                    <Button
                      onClick={() => removeWebhook(endpoint.url)}
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 hover:bg-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Webhook Logs */}
      {logs.length > 0 && (
        <Card className="glass-card border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-white">Recent Webhook Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 text-sm bg-gray-800/20 rounded"
                >
                  <div className="flex items-center gap-2">
                    {log.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className="text-gray-300">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-gray-400 font-mono text-xs">
                      {log.endpoint.split('/').pop()}
                    </span>
                  </div>
                  <Badge className={`${
                    log.status === 'success' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  } border-0 text-xs`}>
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WebhookManager;
