
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <CardTitle className="text-lg">Expiration Settings</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="expiry-days" className="text-sm font-medium">
            Auto-delete after
          </Label>
          <Select 
            value={expiryDays.toString()} 
            onValueChange={(value) => setExpiryDays(Number(value))}
          >
            <SelectTrigger id="expiry-days" className="mt-1">
              <SelectValue placeholder="Select days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 day</SelectItem>
              <SelectItem value="3">3 days</SelectItem>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="14">14 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Content will auto-destruct after this period
          </p>
        </div>
        
        <div>
          <Label htmlFor="max-views" className="text-sm font-medium">
            Maximum views
          </Label>
          <Select 
            value={maxViews.toString()} 
            onValueChange={(value) => setMaxViews(Number(value))}
          >
            <SelectTrigger id="max-views" className="mt-1">
              <SelectValue placeholder="Select views" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 view (self-destruct immediately)</SelectItem>
              <SelectItem value="2">2 views</SelectItem>
              <SelectItem value="3">3 views</SelectItem>
              <SelectItem value="5">5 views</SelectItem>
              <SelectItem value="10">10 views</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Content will self-destruct after this many views
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpirationOptions;
