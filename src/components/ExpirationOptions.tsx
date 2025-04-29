
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

interface ExpirationOptionsProps {
  expiryDays: number;
  setExpiryDays: (days: number) => void;
  maxViews: number;
  setMaxViews: (views: number) => void;
}

const ExpirationOptions: React.FC<ExpirationOptionsProps> = ({
  expiryDays, 
  setExpiryDays, 
  maxViews, 
  setMaxViews
}) => {
  return (
    <Card className="shadow-md border-neutral-800 bg-black/80 text-white">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-400" />
          <CardTitle className="text-lg">Expiration Settings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="expiry-days" className="text-sm font-medium text-neutral-300">
            Auto-delete after
          </Label>
          <select 
            id="expiry-days"
            value={expiryDays}
            onChange={(e) => setExpiryDays(Number(e.target.value))}
            className="mt-1 w-full h-10 px-3 py-2 border border-neutral-700 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1">1 day</option>
            <option value="3">3 days</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
          <p className="text-xs text-neutral-400 mt-1">
            Content will auto-destruct after this period
          </p>
        </div>
        
        <div>
          <Label htmlFor="max-views" className="text-sm font-medium text-neutral-300">
            Maximum views
          </Label>
          <select 
            id="max-views"
            value={maxViews}
            onChange={(e) => setMaxViews(Number(e.target.value))}
            className="mt-1 w-full h-10 px-3 py-2 border border-neutral-700 bg-black text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="1">1 view (self-destruct immediately)</option>
            <option value="2">2 views</option>
            <option value="3">3 views</option>
            <option value="5">5 views</option>
            <option value="10">10 views</option>
          </select>
          <p className="text-xs text-neutral-400 mt-1">
            Content will self-destruct after this many views
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpirationOptions;
