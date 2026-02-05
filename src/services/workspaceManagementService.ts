/**
 * Workspace Management Service
 * 
 * Handles workspace operations for organizing submissions.
 * Each user can have multiple workspaces, and each workspace
 * can contain multiple submissions with questions and answers.
 */

import { supabase, getCurrentUserId } from '../lib/supabase';
import { Workspace } from '../types/database';

/**
 * Creates a temporary workspace.
 * Used for new workflows where the user hasn't named the workspace yet.
 *
 * These workspaces have temporary = true and are:
 * - Hidden from the workspaces list
 * - Deleted on new app loads if never saved
 *
 * @returns The newly created temporary workspace
 */
export async function createTemporaryWorkspace(): Promise<Workspace> {
  const userId = getCurrentUserId();
  const timestamp = new Date().toISOString();
  const tempName = `Workspace ${timestamp}`;

  const { data, error } = await supabase
    .from('workspaces')
    .insert({ user_id: userId, name: tempName, temporary: true })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates the name of an existing workspace.
 * 
 * @param workspaceId - The ID of the workspace to update
 * @param newName - The new name for the workspace
 * @returns The updated workspace
 */
export async function updateWorkspaceName(workspaceId: string, newName: string): Promise<Workspace> {
  const userId = getCurrentUserId();

  // Verify the workspace belongs to the current user
  const { data: workspace, error: checkError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (checkError || !workspace) {
    throw new Error('Workspace not found or access denied');
  }

  // Update the workspace name and mark as non-temporary (saved)
  const { data, error } = await supabase
    .from('workspaces')
    .update({ name: newName, temporary: false })
    .eq('id', workspaceId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Gets an existing workspace by name for the current user.
 * This no longer creates workspaces; it only fetches.
 * 
 * @param name - The name of the workspace
 * @returns The workspace if it exists, or throws if not found
 */
export async function getWorkspace(name: string): Promise<Workspace> {
  const userId = getCurrentUserId();

  // Check if workspace already exists for this user
  const { data: existing } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', userId)
    .eq('name', name)
    .single();

  if (!existing) {
    throw new Error(`Workspace "${name}" not found for current user.`);
  }

  return existing;
}

/**
 * Deletes a workspace and all its associated data.
 * This will cascade delete:
 * - All submissions in the workspace
 * - All questions in those submissions
 * - All answers to those questions
 * - All evaluations for those submissions
 * 
 * @param workspaceId - The ID of the workspace to delete
 */
export async function deleteWorkspace(workspaceId: string): Promise<void> {
  const userId = getCurrentUserId();

  // Verify the workspace belongs to the current user before deleting
  const { data: workspace, error: checkError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', workspaceId)
    .eq('user_id', userId)
    .single();

  if (checkError || !workspace) {
    throw new Error('Workspace not found or access denied');
  }

  // Delete the workspace (cascade will handle all related data)
  const { error } = await supabase.from('workspaces').delete().eq('id', workspaceId);

  if (error) throw error;
}

/**
 * Gets all workspaces for the current user.
 * 
 * @returns Array of all workspaces owned by the current user
 */
export async function getAllUserWorkspaces(): Promise<Workspace[]> {
  const userId = getCurrentUserId();
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const all = data || [];

  // Filter out temporary/unsaved workspaces so they never appear in the list.
  return all.filter((workspace) => !workspace.temporary);
}

/**
 * Deletes all temporary workspaces for the current user.
 *
 * This is called on app entry points (landing, /workspaces) to ensure that
 * any unfinished workflows don't leave behind orphaned workspaces.
 */
export async function deleteTemporaryWorkspaces(): Promise<void> {
  const userId = getCurrentUserId();

  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('user_id', userId)
    .eq('temporary', true);

  if (error) throw error;
}
