import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isPro: boolean;
    initialize: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithKakao: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true,
    isPro: false,

    initialize: async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            let isPro = false;
            if (session?.user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('is_pro')
                    .eq('id', session.user.id)
                    .single();
                isPro = data?.is_pro ?? false;
            }

            set({ session, user: session?.user ?? null, isPro, isLoading: false });

            supabase.auth.onAuthStateChange(async (_event, session) => {
                let isPro = false;
                if (session?.user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('is_pro')
                        .eq('id', session.user.id)
                        .single();
                    isPro = data?.is_pro ?? false;
                }
                set({ session, user: session?.user ?? null, isPro });
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            set({ isLoading: false });
        }
    },

    signInWithGoogle: async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
    },

    signInWithKakao: async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'kakao',
        });
    },



    signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, isPro: false });
    },
}));
