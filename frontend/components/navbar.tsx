"use client";

import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/navbar";
import { Kbd } from "@nextui-org/kbd";
import { Link } from "@nextui-org/link";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import NextLink from "next/link";
import clsx from "clsx";
import { button as buttonStyles, link as linkStyles } from "@nextui-org/theme";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, SearchIcon, Logo } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";

const getLinkColor = (index: number, length: number) => {
  if (index === 2) return "primary";
  if (index === length - 1) return "danger";

  return "foreground";
};

export const Navbar = () => {
  const { user, signOut } = useAuth();

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["shift"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <NextUINavbar className="bg-transparent" maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit">ABlog</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map(
            (item) =>
              // Only show items that don't require auth, or if they do, user must be logged in
              (!item.requiresAuth || (item.requiresAuth && user)) && (
                <NavbarItem key={item.href}>
                  <NextLink
                    className={clsx(
                      linkStyles({ color: "foreground" }),
                      "data-[active=true]:text-orange-500 data-[active=true]:font-medium",
                    )}
                    color="foreground"
                    href={item.href}
                  >
                    {item.label}
                  </NextLink>
                </NavbarItem>
              ),
          )}
        </ul>
        {user && (
          <NavbarItem>
            <Link
              className={
                buttonStyles({ variant: "bordered", radius: "full" }) +
                " ml-4 font-bold"
              }
              href="/new"
            >
              New article
            </Link>
          </NavbarItem>
        )}
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <Link isExternal aria-label="Github" href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
        <NavbarItem>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-default-600">{user.full_name}</span>
              <Button
                className={`${buttonStyles({ variant: "flat", radius: "full" })} border-medium font-bold border-red-500 hover:bg-red-600 text-white px-8`}
                onPress={signOut}
              >
                Log Out
              </Button>
            </div>
          ) : (
            <Link
              className={`${buttonStyles({ variant: "flat", radius: "full" })} bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8`}
              href="/auth"
            >
              Sign In
            </Link>
          )}
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <Link
                color={getLinkColor(index, siteConfig.navMenuItems.length)}
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
