-- Add column to store which columns should hide the overdue flag
ALTER TABLE custom_boards 
ADD COLUMN hide_overdue_columns text[] DEFAULT '{}';