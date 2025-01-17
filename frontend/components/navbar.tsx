"use client";

import React from "react";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
} from "@nextui-org/navbar";
import { Link } from "@nextui-org/link";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import { motion } from "framer-motion";

import { SearchBar } from "./search-bar";

import { useAuth } from "@/contexts/auth-context";
import { Logo } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { useArticles } from "@/hooks/useArticles";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { articles } = useArticles();

  const renderNavItems = () => (
    <ul className="hidden lg:flex gap-4 justify-start ml-2">
      {siteConfig.navItems.map(
        (item) =>
          (!item.requiresAuth || (item.requiresAuth && user)) && (
            <NavbarItem key={item.href}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NextLink
                  className="text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  href={item.href}
                >
                  {item.label}
                </NextLink>
              </motion.div>
            </NavbarItem>
          ),
      )}
    </ul>
  );

  const renderAuthSection = () => (
    <NavbarItem className="flex gap-4 items-center">
      {user ? (
        <>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {user.full_name}
          </span>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              className="bg-gradient-to-r from-red-500 to-rose-600 text-white hover:opacity-90"
              size="sm"
              onPress={signOut}
            >
              Log Out
            </Button>
          </motion.div>
        </>
      ) : (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            className="bg-gradient-to-r from-orange-600 to-rose-600 text-white px-4 py-2 rounded-xl hover:opacity-90 dark:from-orange-500 dark:to-rose-500"
            href="/auth"
          >
            Sign In
          </Link>
        </motion.div>
      )}
    </NavbarItem>
  );

  return (
    <NextUINavbar
      className="bg-gradient-to-r from-orange-50/90 to-rose-50/90 dark:from-orange-500/5 dark:to-rose-500/5 backdrop-blur-md border-b border-orange-200/50 dark:border-orange-800/30"
      maxWidth="xl"
      position="sticky"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <NextLink
              className="flex justify-start items-center gap-1"
              href="/"
            >
              <Logo />
              <p className="font-bold bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent dark:from-orange-400 dark:to-rose-400">
                ABlog
              </p>
            </NextLink>
          </motion.div>
        </NavbarBrand>
        {renderNavItems()}
        {user && (
          <NavbarItem>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-400/10 px-4 py-1 rounded-xl"
                href="/new"
              >
                New article
              </Link>
            </motion.div>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden lg:flex">
          <SearchBar articles={articles ?? []} />
        </NavbarItem>
        {renderAuthSection()}
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu className="bg-gradient-to-r from-orange-50/95 to-rose-50/95 dark:from-orange-500/5 dark:to-rose-500/5 backdrop-blur-md pt-6">
        <SearchBar articles={articles ?? []} />
      </NavbarMenu>
    </NextUINavbar>
  );
};
