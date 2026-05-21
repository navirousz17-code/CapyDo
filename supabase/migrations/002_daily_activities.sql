-- Daily Activities Table
CREATE TABLE daily_activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  icon TEXT DEFAULT '⭐' NOT NULL,
  color TEXT DEFAULT '#82bf7b' NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Daily Activity Completions (tracks when each activity was completed)
CREATE TABLE daily_activity_completions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  activity_id UUID REFERENCES daily_activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_date DATE DEFAULT CURRENT_DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(activity_id, completed_date)
);

-- Indexes
CREATE INDEX idx_daily_activities_user_id ON daily_activities(user_id);
CREATE INDEX idx_daily_activity_completions_activity_id ON daily_activity_completions(activity_id);
CREATE INDEX idx_daily_activity_completions_date ON daily_activity_completions(completed_date);
CREATE INDEX idx_daily_activity_completions_user_id ON daily_activity_completions(user_id);

-- RLS
ALTER TABLE daily_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_completions ENABLE ROW LEVEL SECURITY;

-- Policies for daily_activities
CREATE POLICY "Users can view their own daily activities"
  ON daily_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own daily activities"
  ON daily_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own daily activities"
  ON daily_activities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own daily activities"
  ON daily_activities FOR DELETE USING (auth.uid() = user_id);

-- Policies for daily_activity_completions
CREATE POLICY "Users can view their own completions"
  ON daily_activity_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own completions"
  ON daily_activity_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own completions"
  ON daily_activity_completions FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger
CREATE TRIGGER update_daily_activities_updated_at
  BEFORE UPDATE ON daily_activities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE daily_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_activity_completions;
