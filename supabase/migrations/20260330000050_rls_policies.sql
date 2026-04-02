-- Row Level Security policies for all tables

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE respondent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE territory_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own profile; admins see their org
CREATE POLICY profiles_self_read ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY profiles_self_update ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY profiles_org_admin_read ON profiles
  FOR SELECT USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid()
        AND role IN ('org_admin','super_admin')
    )
  );

-- Organizations: org members can view their own org
CREATE POLICY organizations_member_read ON organizations
  FOR SELECT USING (
    id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

CREATE POLICY organizations_admin_all ON organizations
  FOR ALL USING (
    id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid()
        AND role IN ('org_admin','super_admin')
    )
  );

-- org_members: org admins can manage members
CREATE POLICY org_members_self_read ON org_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY org_members_admin_all ON org_members
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid()
        AND role IN ('org_admin','super_admin')
    )
  );

-- Campaigns: org members with role >= viewer can view campaigns of their org
CREATE POLICY campaigns_org_read ON campaigns
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

CREATE POLICY campaigns_manager_write ON campaigns
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_members
      WHERE user_id = auth.uid()
        AND role IN ('org_admin','super_admin','campaign_manager')
    )
  );

-- Campaign assignments: collectors see their own; coordinators see territory
CREATE POLICY campaign_assignments_self ON campaign_assignments
  FOR SELECT USING (collector_id = auth.uid());

CREATE POLICY campaign_assignments_coordinator ON campaign_assignments
  FOR SELECT USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN org_members om ON om.org_id = c.org_id
      WHERE om.user_id = auth.uid()
        AND om.role IN ('org_admin','super_admin','campaign_manager','field_coordinator')
    )
  );

-- Survey forms: org members can read; managers can write
CREATE POLICY survey_forms_org_read ON survey_forms
  FOR SELECT USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN org_members om ON om.org_id = c.org_id
      WHERE om.user_id = auth.uid()
    )
  );

CREATE POLICY survey_forms_manager_write ON survey_forms
  FOR ALL USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN org_members om ON om.org_id = c.org_id
      WHERE om.user_id = auth.uid()
        AND om.role IN ('org_admin','super_admin','campaign_manager')
    )
  );

-- Survey responses: collectors see their own; coordinators/analysts see org
CREATE POLICY responses_self ON survey_responses
  FOR SELECT USING (collector_id = auth.uid());

CREATE POLICY responses_insert_self ON survey_responses
  FOR INSERT WITH CHECK (collector_id = auth.uid());

CREATE POLICY responses_org_read ON survey_responses
  FOR SELECT USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN org_members om ON om.org_id = c.org_id
      WHERE om.user_id = auth.uid()
        AND om.role IN ('org_admin','super_admin','campaign_manager','field_coordinator','analyst')
    )
  );

-- Sync queue: users can only see/insert their own device_id entries
CREATE POLICY sync_queue_self ON sync_queue
  FOR ALL USING (user_id = auth.uid());

-- Offline packages: users see their own
CREATE POLICY offline_packages_self ON offline_packages
  FOR SELECT USING (user_id = auth.uid());

-- Analytics events: org members can read
CREATE POLICY analytics_events_org_read ON analytics_events
  FOR SELECT USING (
    org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid())
  );

-- Territory stats: org members can read
CREATE POLICY territory_stats_org_read ON territory_stats
  FOR SELECT USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN org_members om ON om.org_id = c.org_id
      WHERE om.user_id = auth.uid()
    )
  );

-- ML predictions: access based on org_id of the campaign
CREATE POLICY ml_predictions_org_read ON ml_predictions
  FOR SELECT USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN org_members om ON om.org_id = c.org_id
      WHERE om.user_id = auth.uid()
    )
  );
