-- Create admin activity logs table
CREATE TABLE public.admin_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.admin_activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert activity logs
CREATE POLICY "Admins can insert activity logs"
ON public.admin_activity_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_admin_activity_logs_created_at ON public.admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_activity_logs_entity_type ON public.admin_activity_logs(entity_type);
CREATE INDEX idx_admin_activity_logs_admin_id ON public.admin_activity_logs(admin_id);